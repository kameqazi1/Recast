CREATE TYPE "public"."content_output_format" AS ENUM('blog_post', 'tweet_thread', 'show_notes', 'newsletter');--> statement-breakpoint
CREATE TYPE "public"."content_output_status" AS ENUM('pending', 'generating', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."episode_status" AS ENUM('uploading', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "clips" (
	"id" text PRIMARY KEY NOT NULL,
	"episode_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"start_time" integer NOT NULL,
	"end_time" integer NOT NULL,
	"file_url" text,
	"confidence" integer,
	"exported" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_outputs" (
	"id" text PRIMARY KEY NOT NULL,
	"episode_id" text NOT NULL,
	"user_id" text NOT NULL,
	"format" "content_output_format" NOT NULL,
	"content" text,
	"word_count" integer,
	"voice_profile_id" text,
	"status" "content_output_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration" integer,
	"file_url" text,
	"file_size" integer,
	"status" "episode_status" DEFAULT 'uploading' NOT NULL,
	"transcript_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_log" (
	"id" text PRIMARY KEY NOT NULL,
	"month" text NOT NULL,
	"deepgram_minutes" integer DEFAULT 0 NOT NULL,
	"inngest_runs" integer DEFAULT 0 NOT NULL,
	"r2_storage_bytes" bigint DEFAULT 0 NOT NULL,
	"r2_writes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"month" text NOT NULL,
	"llm_generations" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"tone" text,
	"example_output" text,
	"avoid_words" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clips" ADD CONSTRAINT "clips_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_outputs" ADD CONSTRAINT "content_outputs_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_outputs" ADD CONSTRAINT "content_outputs_voice_profile_id_voice_profiles_id_fk" FOREIGN KEY ("voice_profile_id") REFERENCES "public"."voice_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_outputs_episode_status_idx" ON "content_outputs" USING btree ("episode_id","status");