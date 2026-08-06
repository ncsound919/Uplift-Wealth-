ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T14:42:15.135Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T14:42:15.131Z';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_public" boolean DEFAULT false NOT NULL;