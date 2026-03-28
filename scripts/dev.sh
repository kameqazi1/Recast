#!/bin/bash
#
# Local development startup script with step-by-step logging.
# Usage: npm run dev
#

set -e

# ── Colors ───────────────────────────────────────────────────────────
if [ -t 1 ] && [ -z "$NO_COLOR" ]; then
  RESET='\033[0m'; GREEN='\033[32m'; RED='\033[31m'
  YELLOW='\033[33m'; CYAN='\033[36m'; DIM='\033[2m'; BOLD='\033[1m'
else
  RESET=''; GREEN=''; RED=''; YELLOW=''; CYAN=''; DIM=''; BOLD=''
fi

log()  { echo -e "${DIM}[$(date +%H:%M:%S)]${RESET} ${CYAN}[$1]${RESET} $2"; }
ok()   { echo -e "${DIM}[$(date +%H:%M:%S)]${RESET} ${GREEN}✓ [$1]${RESET} $2"; }
warn() { echo -e "${DIM}[$(date +%H:%M:%S)]${RESET} ${YELLOW}⚠ [$1]${RESET} $2"; }
fail() { echo -e "${DIM}[$(date +%H:%M:%S)]${RESET} ${RED}✗ [$1]${RESET} $2"; }
banner() { echo -e "\n${BOLD}${CYAN}━━━ $1 ━━━${RESET}\n"; }

# ── Step 1: Node.js ─────────────────────────────────────────────────
banner "Step 1/6: Node.js"
log "node" "Checking Node.js version..."
NODE_V=$(node -v)
ok "node" "Node.js $NODE_V"

# ── Step 2: Environment Variables ────────────────────────────────────
banner "Step 2/6: Environment Variables"
log "env" "Loading .env.local..."

if [ ! -f .env.local ]; then
  fail "env" ".env.local not found — copy .env.example to .env.local"
  exit 1
fi

VAR_COUNT=$(grep -c '=' .env.local 2>/dev/null || echo 0)
ok "env" ".env.local loaded ($VAR_COUNT variables)"

REQUIRED_VARS=(
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  DATABASE_URL
  R2_ACCOUNT_ID
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_BUCKET_NAME
  INNGEST_SIGNING_KEY
  DEEPGRAM_API_KEY
  ANTHROPIC_API_KEY
  RESEND_API_KEY
)

ENV_OK=true
for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${var}=" .env.local; then
    fail "env" "Missing: $var"
    ENV_OK=false
  fi
done

if [ "$ENV_OK" = false ]; then
  fail "env" "Fix missing environment variables before starting"
  exit 1
fi
ok "env" "All required environment variables present"

# Detect Clerk mode
CLERK_KEY=$(grep '^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=' .env.local | cut -d= -f2)
if [[ "$CLERK_KEY" == pk_test_* ]]; then
  ok "env" "Clerk mode: DEVELOPMENT"
elif [[ "$CLERK_KEY" == pk_live_* ]]; then
  warn "env" "Clerk mode: PRODUCTION — sign-in requires a production Clerk account"
else
  warn "env" "Clerk key format not recognized"
fi

# ── Step 3: Port Availability ────────────────────────────────────────
banner "Step 3/6: Port Availability"

check_port() {
  local port=$1
  local name=$2
  local pid=$(lsof -i :$port -t 2>/dev/null | head -1)
  if [ -n "$pid" ]; then
    warn "ports" "Port $port in use (PID $pid) — $name may use a different port"
  else
    ok "ports" "Port $port available for $name"
  fi
}

check_port 3000 "Next.js"
check_port 8288 "Inngest"

# ── Step 4: Database ─────────────────────────────────────────────────
banner "Step 4/6: Database"
log "db" "Checking database config..."

DB_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2 | tr -d '"')
if [ -n "$DB_URL" ]; then
  DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@\([^/]*\)/.*|\1|p')
  DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
  ok "db" "Host: $DB_HOST"
  ok "db" "Database: $DB_NAME"
else
  warn "db" "Could not parse DATABASE_URL"
fi

# ── Step 5: Inngest Dev Server ───────────────────────────────────────
banner "Step 5/6: Inngest Dev Server"
log "inngest" "Starting Inngest dev server in background..."

npx inngest-cli@latest dev &
INNGEST_PID=$!
ok "inngest" "Inngest starting (PID $INNGEST_PID) → http://localhost:8288"

# ── Step 6: Next.js Dev Server ───────────────────────────────────────
banner "Step 6/6: Next.js Dev Server"
log "next" "Starting Next.js dev server (takes ~2 min with Turbopack)..."
echo ""

# ── Summary ──────────────────────────────────────────────────────────
ok "startup" "Next.js  → http://localhost:3000"
ok "startup" "Inngest  → http://localhost:8288"
echo -e "\n${DIM}  Press Ctrl+C to stop all servers${RESET}\n"

# Trap Ctrl+C to kill Inngest background process
cleanup() {
  echo ""
  log "shutdown" "Stopping servers..."
  kill $INNGEST_PID 2>/dev/null
  wait $INNGEST_PID 2>/dev/null
  ok "shutdown" "All servers stopped."
  exit 0
}
trap cleanup SIGINT SIGTERM

# Run Next.js in foreground (gets proper TTY)
npx next dev
