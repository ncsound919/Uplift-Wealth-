-- Overlay Wealth - Supabase schema import
-- Generated from src/db/migrations/*.sql
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- It creates all tables AND marks the app's migrations as applied so the
-- app won't try to re-run them on first boot.

CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at text NOT NULL);

-- ===== 0000_regular_diamondback.sql =====
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" text NOT NULL,
	"ip" text NOT NULL,
	"method" text NOT NULL,
	"path" text NOT NULL,
	"user_id" text,
	"action" text NOT NULL
);
CREATE TABLE "donations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"tier_label" text,
	"timestamp" text NOT NULL
);
CREATE TABLE "progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"completed_lessons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"completed_modules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quiz_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"certificates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" text DEFAULT '2026-08-06T11:48:34.023Z' NOT NULL
);
CREATE TABLE "sandboxes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sandbox_type" text NOT NULL,
	"state_data" jsonb NOT NULL,
	"saved_at" text NOT NULL,
	"notes" text
);
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"track" text DEFAULT 'all' NOT NULL,
	"avatar" text,
	"badges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"last_active" text NOT NULL,
	"email" text,
	"password_hash" text,
	"created_at" text DEFAULT '2026-08-06T11:48:34.022Z' NOT NULL
);

-- ===== 0001_opposite_trauma.sql =====
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T12:01:51.482Z';
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T12:01:51.478Z';
ALTER TABLE "progress" ADD COLUMN "xp" integer DEFAULT 0 NOT NULL;
ALTER TABLE "progress" ADD COLUMN "game_time_seconds" integer DEFAULT 0 NOT NULL;

-- ===== 0002_wakeful_preak.sql =====
CREATE TABLE "waitlist_emails" (
	"email" text PRIMARY KEY NOT NULL,
	"source" text,
	"created_at" text NOT NULL
);
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T13:04:09.440Z';
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T13:04:09.438Z';

-- ===== 0003_amusing_cobalt_man.sql =====
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T13:57:15.625Z';
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T13:57:15.620Z';
ALTER TABLE "users" ADD COLUMN "token_version" integer DEFAULT 0 NOT NULL;

-- ===== 0004_hot_obadiah_stane.sql =====
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" text NOT NULL,
	"upvoted_by" jsonb DEFAULT '[]'::jsonb NOT NULL
);
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reason" text,
	"created_at" text NOT NULL
);
CREATE TABLE "threads" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text,
	"lesson_id" text,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_at" text NOT NULL,
	"upvoted_by" jsonb DEFAULT '[]'::jsonb NOT NULL
);
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T14:16:06.233Z';
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T14:16:06.228Z';

-- ===== 0005_workable_plazm.sql =====
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T14:42:15.135Z';
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T14:42:15.131Z';
ALTER TABLE "users" ADD COLUMN "profile_public" boolean DEFAULT false NOT NULL;

-- ===== 0006_damp_supernaut.sql =====
CREATE TABLE "cohorts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'general' NOT NULL,
	"description" text,
	"owner_id" text NOT NULL,
	"created_at" text NOT NULL,
	"member_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"invite_code" text NOT NULL
);
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T14:54:59.958Z';
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T14:54:59.955Z';

-- ===== 0007_square_sprite.sql =====
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text DEFAULT 'system' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL
);
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T15:05:30.349Z';
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T15:05:30.346Z';

-- ===== 0008_aberrant_anita_blake.sql =====
CREATE TABLE "content_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"content" text NOT NULL,
	"version" integer NOT NULL,
	"updated_by" text NOT NULL,
	"updated_at" text NOT NULL
);
CREATE TABLE "creator_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bio" text NOT NULL,
	"portfolio_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text NOT NULL,
	"reviewed_at" text
);
CREATE TABLE "lesson_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"content" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_by" text NOT NULL,
	"updated_at" text NOT NULL
);
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T15:28:13.700Z';
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T15:28:13.696Z';
ALTER TABLE "users" ADD COLUMN "creator_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN "creator_bio" text;

-- ===== 0009_vengeful_skrulls.sql =====
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T16:34:30.574Z';
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T16:34:30.570Z';
ALTER TABLE "cohorts" ADD COLUMN "module_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "users" ADD COLUMN "subscription_tier" text DEFAULT 'free' NOT NULL;
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" text;

-- Mark all migrations as applied (the app skips these on boot)
INSERT INTO schema_migrations (name, applied_at) VALUES
  ('0000_regular_diamondback.sql', now()),
  ('0001_opposite_trauma.sql', now()),
  ('0002_wakeful_preak.sql', now()),
  ('0003_amusing_cobalt_man.sql', now()),
  ('0004_hot_obadiah_stane.sql', now()),
  ('0005_workable_plazm.sql', now()),
  ('0006_damp_supernaut.sql', now()),
  ('0007_square_sprite.sql', now()),
  ('0008_aberrant_anita_blake.sql', now()),
  ('0009_vengeful_skrulls.sql', now());
