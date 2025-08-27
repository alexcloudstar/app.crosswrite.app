-- Add composite indexes for better analytics query performance
-- These indexes will improve performance for user-scoped date range queries

-- Composite index for platform + date range queries
CREATE INDEX "analytics_platform_date_idx" ON "analytics" USING btree (
  platform,
  recorded_at
);

-- Composite index for draft + date queries
CREATE INDEX "analytics_draft_date_idx" ON "analytics" USING btree (
  draft_id,
  recorded_at
);

-- Note: User-scoped queries are handled by the existing drafts.user_id index
-- combined with the analytics.draft_id foreign key relationship
