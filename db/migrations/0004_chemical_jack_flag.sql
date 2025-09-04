ALTER TABLE "user" ALTER COLUMN "plan_tier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan_tier" SET DEFAULT 'free'::text;--> statement-breakpoint
DROP TYPE "public"."plan_tier";--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('free', 'pro');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan_tier" SET DEFAULT 'free'::"public"."plan_tier";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan_tier" SET DATA TYPE "public"."plan_tier" USING "plan_tier"::"public"."plan_tier";