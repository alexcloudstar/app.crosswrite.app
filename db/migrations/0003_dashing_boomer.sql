ALTER TABLE "user" ALTER COLUMN "plan_tier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan_tier" SET DEFAULT 'FREE'::text;--> statement-breakpoint
DROP TYPE "public"."plan_tier";--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('FREE', 'PRO');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan_tier" SET DEFAULT 'FREE'::"public"."plan_tier";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan_tier" SET DATA TYPE "public"."plan_tier" USING "plan_tier"::"public"."plan_tier";