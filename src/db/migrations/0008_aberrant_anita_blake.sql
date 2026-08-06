CREATE TABLE "content_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"content" text NOT NULL,
	"version" integer NOT NULL,
	"updated_by" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bio" text NOT NULL,
	"portfolio_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text NOT NULL,
	"reviewed_at" text
);
--> statement-breakpoint
CREATE TABLE "lesson_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"content" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_by" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T15:28:13.700Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T15:28:13.696Z';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "creator_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "creator_bio" text;