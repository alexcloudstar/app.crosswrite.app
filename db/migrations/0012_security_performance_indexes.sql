-- Add missing indexes for hot query paths
-- This migration adds indexes to optimize the most frequently accessed queries

-- Drafts: optimize list queries with user_id + status + updated_at DESC
CREATE INDEX IF NOT EXISTS "drafts_user_status_updated_idx" ON "drafts" ("user_id", "status", "updated_at" DESC);

-- Scheduled posts: optimize scheduler queries with user_id + scheduled_at + status
CREATE INDEX IF NOT EXISTS "scheduled_posts_user_scheduled_status_idx" ON "scheduled_posts" ("user_id", "scheduled_at", "status");

-- Platform posts: optimize publish flow queries with draft_id + platform + status
CREATE INDEX IF NOT EXISTS "platform_posts_draft_platform_status_idx" ON "platform_posts" ("draft_id", "platform", "status");

-- User usage: optimize usage tracking queries with user_id + month_year
-- Note: unique index already exists, but adding a simple index for faster lookups
CREATE INDEX IF NOT EXISTS "user_usage_user_month_idx" ON "user_usage" ("user_id", "month_year");

-- Integrations: optimize connection queries with user_id + platform + status
CREATE INDEX IF NOT EXISTS "integrations_user_platform_status_idx" ON "integrations" ("user_id", "platform", "status");

-- Add composite index for drafts search (user_id + search terms)
CREATE INDEX IF NOT EXISTS "drafts_user_search_idx" ON "drafts" USING gin ("user_id", to_tsvector('english', title || ' ' || COALESCE(content_preview, '')));

-- Add index for scheduler job claiming (status + scheduled_at + claim_token)
CREATE INDEX IF NOT EXISTS "scheduled_posts_claim_idx" ON "scheduled_posts" ("status", "scheduled_at") WHERE "status" = 'pending';

-- Add index for analytics queries (if analytics table exists in future)
-- CREATE INDEX IF NOT EXISTS "analytics_user_recorded_idx" ON "analytics" ("user_id", "recorded_at");
-- CREATE INDEX IF NOT EXISTS "analytics_user_platform_idx" ON "analytics" ("user_id", "platform");
