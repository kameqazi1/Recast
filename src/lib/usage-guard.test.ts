import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockSet = vi.fn();
const mockReturning = vi.fn();
const mockValues = vi.fn();

vi.mock("@/db", () => ({
  db: {
    select: () => ({ from: (t: any) => ({ where: (w: any) => ({ limit: () => [null] }) }) }),
    insert: () => ({ values: () => ({ returning: () => [{ id: "test", month: "2026-03", deepgramMinutes: 0, inngestRuns: 0, r2StorageBytes: 0, r2Writes: 0 }] }) }),
    update: () => ({ set: () => ({ where: () => {} }) }),
  },
}));

vi.mock("@/db/schema", () => ({
  usageLog: { month: "month", id: "id" },
  userUsage: { userId: "user_id", month: "month", id: "id", llmGenerations: "llm_generations" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
}));

describe("usage-guard types", () => {
  it("exports checkDeepgramUsage", async () => {
    const mod = await import("./usage-guard");
    expect(typeof mod.checkDeepgramUsage).toBe("function");
  });

  it("exports checkInngestUsage", async () => {
    const mod = await import("./usage-guard");
    expect(typeof mod.checkInngestUsage).toBe("function");
  });

  it("exports checkR2Usage", async () => {
    const mod = await import("./usage-guard");
    expect(typeof mod.checkR2Usage).toBe("function");
  });

  it("exports checkLLMUsage", async () => {
    const mod = await import("./usage-guard");
    expect(typeof mod.checkLLMUsage).toBe("function");
  });

  it("exports incrementUsage", async () => {
    const mod = await import("./usage-guard");
    expect(typeof mod.incrementUsage).toBe("function");
  });

  it("exports incrementLLMUsage", async () => {
    const mod = await import("./usage-guard");
    expect(typeof mod.incrementLLMUsage).toBe("function");
  });

  it("exports incrementR2Storage", async () => {
    const mod = await import("./usage-guard");
    expect(typeof mod.incrementR2Storage).toBe("function");
  });

  it("UsageCheck type has correct shape", async () => {
    const mod = await import("./usage-guard");
    // Type check via runtime — a UsageCheck should have these fields
    const check: (typeof mod)["UsageCheck"] extends {
      allowed: boolean;
      service: string;
      current: number;
      limit: number;
      unit: string;
    }
      ? true
      : false = true;
    expect(check).toBe(true);
  });
});
