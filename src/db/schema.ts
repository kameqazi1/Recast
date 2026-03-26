import {
  pgTable,
  text,
  timestamp,
  integer,
  bigint,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const episodeStatusEnum = pgEnum("episode_status", [
  "uploading",
  "processing",
  "completed",
  "failed",
]);

export const contentOutputFormatEnum = pgEnum("content_output_format", [
  "blog_post",
  "tweet_thread",
  "show_notes",
  "newsletter",
]);

export const contentOutputStatusEnum = pgEnum("content_output_status", [
  "pending",
  "generating",
  "completed",
  "failed",
]);

export const episodes = pgTable("episodes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration"), // seconds
  fileUrl: text("file_url"),
  fileSize: integer("file_size"), // bytes
  status: episodeStatusEnum("status").notNull().default("uploading"),
  transcriptText: text("transcript_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clips = pgTable("clips", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  episodeId: text("episode_id")
    .notNull()
    .references(() => episodes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  startTime: integer("start_time").notNull(), // seconds
  endTime: integer("end_time").notNull(), // seconds
  fileUrl: text("file_url"),
  confidence: integer("confidence"), // 0-100
  exported: integer("exported").default(0), // export count
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Voice profiles for content generation tone matching
export const voiceProfiles = pgTable("voice_profiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  tone: text("tone"), // max 500 chars, freeform description
  exampleOutput: text("example_output"), // max 2000 chars, few-shot example
  avoidWords: text("avoid_words"), // max 500 chars, comma-separated
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Generated content outputs per episode per format
export const contentOutputs = pgTable(
  "content_outputs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    episodeId: text("episode_id")
      .notNull()
      .references(() => episodes.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    format: contentOutputFormatEnum("format").notNull(),
    content: text("content"),
    wordCount: integer("word_count"),
    voiceProfileId: text("voice_profile_id").references(
      () => voiceProfiles.id,
      { onDelete: "set null" }
    ),
    status: contentOutputStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("content_outputs_episode_status_idx").on(
      table.episodeId,
      table.status
    ),
  ]
);

// Per-user LLM usage tracking (separate from global platform usage)
export const userUsage = pgTable("user_usage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  month: text("month").notNull(), // "2026-03"
  llmGenerations: integer("llm_generations").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Monthly usage tracking for free tier guardrails (global platform limits)
export const usageLog = pgTable("usage_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  month: text("month").notNull(), // "2026-03"
  deepgramMinutes: integer("deepgram_minutes").notNull().default(0),
  inngestRuns: integer("inngest_runs").notNull().default(0),
  r2StorageBytes: bigint("r2_storage_bytes", { mode: "number" }).notNull().default(0),
  r2Writes: integer("r2_writes").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
