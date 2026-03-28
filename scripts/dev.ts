#!/usr/bin/env npx tsx
/**
 * Local development startup script with step-by-step logging.
 * Usage: npm run dev
 */

import { execSync, spawn, type ChildProcess } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Colors ──────────────────────────────────────────────────────────
const noColor = !!process.env.NO_COLOR;
const RESET  = noColor ? "" : "\x1b[0m";
const GREEN  = noColor ? "" : "\x1b[32m";
const RED    = noColor ? "" : "\x1b[31m";
const YELLOW = noColor ? "" : "\x1b[33m";
const CYAN   = noColor ? "" : "\x1b[36m";
const DIM    = noColor ? "" : "\x1b[2m";
const BOLD   = noColor ? "" : "\x1b[1m";

function log(step: string, msg: string) {
  const time = new Date().toLocaleTimeString();
  process.stdout.write(`${DIM}[${time}]${RESET} ${CYAN}[${step}]${RESET} ${msg}\n`);
}

function ok(step: string, msg: string) {
  const time = new Date().toLocaleTimeString();
  process.stdout.write(`${DIM}[${time}]${RESET} ${GREEN}✓ [${step}]${RESET} ${msg}\n`);
}

function warn(step: string, msg: string) {
  const time = new Date().toLocaleTimeString();
  process.stdout.write(`${DIM}[${time}]${RESET} ${YELLOW}⚠ [${step}]${RESET} ${msg}\n`);
}

function fail(step: string, msg: string) {
  const time = new Date().toLocaleTimeString();
  process.stdout.write(`${DIM}[${time}]${RESET} ${RED}✗ [${step}]${RESET} ${msg}\n`);
}

function banner(msg: string) {
  process.stdout.write(`\n${BOLD}${CYAN}━━━ ${msg} ━━━${RESET}\n\n`);
}

function routeLog(line: string) {
  // Next.js route compilation logs
  if (line.includes("GET") || line.includes("POST") || line.includes("PUT") || line.includes("DELETE")) {
    ok("next", `Route compiled: ${line}`);
  } else if (line.includes("compiled") || line.includes("Compiled")) {
    ok("next", line);
  } else {
    log("next", line);
  }
}

// ── Step 1: Check Node version ──────────────────────────────────────
banner("Step 1/6: Node.js");
log("node", "Checking Node.js version...");
ok("node", `Node.js ${process.version}`);

// ── Step 2: Check required env vars ─────────────────────────────────
banner("Step 2/6: Environment Variables");
log("env", "Loading .env.local...");

const requiredVars = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "INNGEST_SIGNING_KEY",
  "DEEPGRAM_API_KEY",
  "ANTHROPIC_API_KEY",
  "RESEND_API_KEY",
];

const envPath = resolve(process.cwd(), ".env.local");
let envVars: Record<string, string> = {};
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, "");
    envVars[key] = val;
  }
  ok("env", `.env.local loaded (${Object.keys(envVars).length} variables)`);
} catch {
  fail("env", ".env.local not found — copy .env.example to .env.local");
  process.exit(1);
}

let envOk = true;
for (const v of requiredVars) {
  if (!envVars[v]) {
    fail("env", `Missing: ${v}`);
    envOk = false;
  }
}
if (!envOk) {
  fail("env", "Fix missing environment variables before starting");
  process.exit(1);
}
ok("env", "All required environment variables present");

const clerkKey = envVars["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] || "";
if (clerkKey.startsWith("pk_test_")) {
  ok("env", "Clerk mode: DEVELOPMENT");
} else if (clerkKey.startsWith("pk_live_")) {
  warn("env", "Clerk mode: PRODUCTION — sign-in requires a production Clerk account");
} else {
  warn("env", "Clerk key format not recognized");
}

// ── Step 3: Check port availability ─────────────────────────────────
banner("Step 3/6: Port Availability");

function isPortInUse(port: number): string | null {
  try {
    const result = execSync(`lsof -i :${port} -t 2>/dev/null`, { encoding: "utf-8" }).trim();
    return result || null;
  } catch {
    return null;
  }
}

const port3000 = isPortInUse(3000);
const port8288 = isPortInUse(8288);

if (port3000) {
  warn("ports", `Port 3000 in use (PID ${port3000}) — Next.js may use a different port`);
} else {
  ok("ports", "Port 3000 available for Next.js");
}

if (port8288) {
  warn("ports", `Port 8288 in use (PID ${port8288}) — Inngest may already be running`);
} else {
  ok("ports", "Port 8288 available for Inngest");
}

// ── Step 4: Check database ──────────────────────────────────────────
banner("Step 4/6: Database");
log("db", "Checking database config...");
try {
  const dbUrl = new URL(envVars["DATABASE_URL"]);
  ok("db", `Host: ${dbUrl.hostname}`);
  ok("db", `Database: ${dbUrl.pathname.slice(1)}`);
} catch {
  warn("db", "Could not parse DATABASE_URL");
}

// ── Helper: parse output lines for a given service ──────────────────
function handleNextLine(l: string) {
  if (!l) return;
  if (l.includes("Ready in")) {
    ok("next", l);
  } else if (l.includes("Local:")) {
    ok("next", l.replace("- ", ""));
  } else if (l.includes("Network:")) {
    ok("next", l.replace("- ", ""));
  } else if (l.includes("Environments:")) {
    ok("next", l.replace("- ", ""));
  } else if (l.includes("✓ Compiled") || l.includes("compiled")) {
    ok("next", l);
  } else if (l.includes("Warning") || l.includes("⚠")) {
    warn("next", l);
  } else if (l.startsWith("⨯") || l.includes("Error") || l.includes("error")) {
    fail("next", l);
  } else if (l.includes("GET ") || l.includes("POST ") || l.includes("PUT ")) {
    log("next", `Route: ${l}`);
  } else {
    log("next", l);
  }
}

function handleInngestLine(l: string) {
  if (!l || l.includes("deprecated")) return;
  try {
    const parsed = JSON.parse(l);
    const msg = parsed.msg || l;
    const addr = parsed.addr ? ` (${parsed.addr})` : "";
    if (parsed.level === "ERROR") {
      fail("inngest", msg + addr);
    } else if (parsed.level === "WARN") {
      warn("inngest", msg + addr);
    } else if (msg.includes("starting server") || msg.includes("started") || msg.includes("ready")) {
      ok("inngest", msg + addr);
    } else {
      log("inngest", msg + addr);
    }
  } catch {
    if (l.includes("error") || l.includes("Error")) {
      fail("inngest", l);
    } else {
      log("inngest", l);
    }
  }
}

function processStream(stream: NodeJS.ReadableStream | null, handler: (line: string) => void) {
  if (!stream) return;
  let buffer = "";
  stream.on("data", (data: Buffer) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const l = line.trim();
      if (l) handler(l);
    }
  });
  stream.on("end", () => {
    if (buffer.trim()) handler(buffer.trim());
  });
}

// ── Step 5: Start Next.js ───────────────────────────────────────────
banner("Step 5/6: Next.js Dev Server");
log("next", "Starting Next.js dev server (this takes ~2 min with Turbopack)...");

const nextProc: ChildProcess = spawn("npx", ["next", "dev"], {
  stdio: "pipe",
  cwd: process.cwd(),
});

processStream(nextProc.stdout, handleNextLine);
processStream(nextProc.stderr, handleNextLine);

nextProc.on("exit", (code) => {
  if (code !== null && code !== 0) {
    fail("next", `Process exited with code ${code}`);
  }
});

// ── Step 6: Start Inngest ───────────────────────────────────────────
banner("Step 6/6: Inngest Dev Server");
log("inngest", "Starting Inngest dev server...");

const inngestProc: ChildProcess = spawn("npx", ["inngest-cli@latest", "dev"], {
  stdio: "pipe",
  cwd: process.cwd(),
});

processStream(inngestProc.stdout, handleInngestLine);
processStream(inngestProc.stderr, handleInngestLine);

inngestProc.on("exit", (code) => {
  if (code !== null && code !== 0) {
    fail("inngest", `Process exited with code ${code}`);
  }
});

// ── Ready ───────────────────────────────────────────────────────────
banner("Startup Complete");
ok("startup", "Both servers launching...");
ok("startup", "Next.js  → http://localhost:3000 (compiling...)");
ok("startup", "Inngest  → http://localhost:8288");
process.stdout.write(`\n${DIM}  Press Ctrl+C to stop all servers${RESET}\n\n`);

// ── Shutdown ────────────────────────────────────────────────────────
function shutdown() {
  process.stdout.write("\n");
  log("shutdown", "Stopping servers...");
  nextProc.kill("SIGTERM");
  inngestProc.kill("SIGTERM");
  setTimeout(() => {
    ok("shutdown", "All servers stopped.");
    process.exit(0);
  }, 2000);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
