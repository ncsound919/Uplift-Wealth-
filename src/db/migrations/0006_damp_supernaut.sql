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
--> statement-breakpoint
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T14:54:59.958Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T14:54:59.955Z';