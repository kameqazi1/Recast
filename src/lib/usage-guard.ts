import { db } from "@/db";
import { usageLog, userUsage } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Free tier limits (with safety margin)
const LIMITS = {
  deepgramMinutes: 2400, // ~40 hours of 45h free ($200 credit)
  inngestRuns: 24000, // 24k of 25k free
  r2StorageBytes: 9 * 1024 * 1024 * 1024, // 9GB of 10GB free
  r2Writes: 900000, // 900k of 1M free
} as const;

function currentMonth() {
  return new Date().toISOString().slice(0, 7); // "2026-03"
}

async function getOrCreateUsage() {
  const month = currentMonth();
  const [existing] = await db
    .select()
    .from(usageLog)
    .where(eq(usageLog.month, month))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(usageLog)
    .values({ month })
    .returning();
  return created;
}

export type UsageCheck = {
  allowed: boolean;
  service: string;
  current: number;
  limit: number;
  unit: string;
};

export async function checkDeepgramUsage(
  estimatedMinutes: number
): Promise<UsageCheck> {
  const usage = await getOrCreateUsage();
  const afterUsage = usage.deepgramMinutes + estimatedMinutes;
  return {
    allowed: afterUsage <= LIMITS.deepgramMinutes,
    service: "Deepgram",
    current: usage.deepgramMinutes,
    limit: LIMITS.deepgramMinutes,
    unit: "minutes",
  };
}

export async function checkInngestUsage(): Promise<UsageCheck> {
  const usage = await getOrCreateUsage();
  return {
    allowed: usage.inngestRuns + 1 <= LIMITS.inngestRuns,
    service: "Inngest",
    current: usage.inngestRuns,
    limit: LIMITS.inngestRuns,
    unit: "runs",
  };
}

export async function checkR2Usage(
  fileBytes: number
): Promise<UsageCheck> {
  const usage = await getOrCreateUsage();
  const afterStorage = usage.r2StorageBytes + fileBytes;
  return {
    allowed:
      afterStorage <= LIMITS.r2StorageBytes &&
      usage.r2Writes + 1 <= LIMITS.r2Writes,
    service: "Cloudflare R2",
    current: usage.r2StorageBytes,
    limit: LIMITS.r2StorageBytes,
    unit: "bytes",
  };
}

export async function incrementUsage(
  field: "deepgramMinutes" | "inngestRuns" | "r2Writes",
  amount: number
) {
  const usage = await getOrCreateUsage();
  await db
    .update(usageLog)
    .set({
      [field]: (usage[field] as number) + amount,
      updatedAt: new Date(),
    })
    .where(eq(usageLog.id, usage.id));
}

export async function incrementR2Storage(bytes: number) {
  const usage = await getOrCreateUsage();
  await db
    .update(usageLog)
    .set({
      r2StorageBytes: usage.r2StorageBytes + bytes,
      r2Writes: usage.r2Writes + 1,
      updatedAt: new Date(),
    })
    .where(eq(usageLog.id, usage.id));
}

// --- Per-user LLM usage tracking ---

const LLM_GENERATION_LIMIT = 40; // 40 format generations per month (~10 episodes)

async function getOrCreateUserUsage(userId: string) {
  const month = currentMonth();
  const [existing] = await db
    .select()
    .from(userUsage)
    .where(and(eq(userUsage.userId, userId), eq(userUsage.month, month)))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(userUsage)
    .values({ userId, month })
    .returning();
  return created;
}

export async function checkLLMUsage(userId: string): Promise<UsageCheck> {
  const usage = await getOrCreateUserUsage(userId);
  return {
    allowed: usage.llmGenerations + 1 <= LLM_GENERATION_LIMIT,
    service: "LLM Content Generation",
    current: usage.llmGenerations,
    limit: LLM_GENERATION_LIMIT,
    unit: "generations",
  };
}

export async function incrementLLMUsage(userId: string, amount: number = 1) {
  const usage = await getOrCreateUserUsage(userId);
  await db
    .update(userUsage)
    .set({
      llmGenerations: usage.llmGenerations + amount,
      updatedAt: new Date(),
    })
    .where(eq(userUsage.id, usage.id));
}
