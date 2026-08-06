CREATE TABLE "waitlist_emails" (
	"email" text PRIMARY KEY NOT NULL,
	"source" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T13:04:09.440Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T13:04:09.438Z';