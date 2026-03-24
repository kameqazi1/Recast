import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const episodeStatusEnum = pgEnum("episode_status", [
  "uploading",
  "processing",
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
