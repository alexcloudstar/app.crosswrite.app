ALTER TABLE "scheduled_posts" ADD COLUMN "retry_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "scheduled_posts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;