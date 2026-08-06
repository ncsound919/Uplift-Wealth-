ALTER TABLE "progress" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T12:01:51.482Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T12:01:51.478Z';--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "xp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "game_time_seconds" integer DEFAULT 0 NOT NULL;