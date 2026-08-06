ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T13:57:15.625Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T13:57:15.620Z';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "token_version" integer DEFAULT 0 NOT NULL;