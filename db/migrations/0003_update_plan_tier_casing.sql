-- Update plan_tier enum values from lowercase to uppercase
-- First, update existing data
UPDATE "user" SET "plan_tier" = 'FREE' WHERE "plan_tier" = 'free';
UPDATE "user" SET "plan_tier" = 'PRO' WHERE "plan_tier" = 'pro';

-- Drop the old enum type
DROP TYPE "plan_tier";

-- Create the new enum type with uppercase values (matching DatabasePlanTierEnum)
CREATE TYPE "plan_tier" AS ENUM('FREE', 'PRO');

-- Add the column back with the new enum type
ALTER TABLE "user" ALTER COLUMN "plan_tier" TYPE "plan_tier" USING "plan_tier"::text::"plan_tier";
ALTER TABLE "user" ALTER COLUMN "plan_tier" SET DEFAULT 'FREE';
