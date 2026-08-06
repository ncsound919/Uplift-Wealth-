CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" text NOT NULL,
	"ip" text NOT NULL,
	"method" text NOT NULL,
	"path" text NOT NULL,
	"user_id" text,
	"action" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"tier_label" text,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"completed_lessons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"completed_modules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quiz_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"certificates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" text DEFAULT '2026-08-06T11:48:34.023Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandboxes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sandbox_type" text NOT NULL,
	"state_data" jsonb NOT NULL,
	"saved_at" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
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
