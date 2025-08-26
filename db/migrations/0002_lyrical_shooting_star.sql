CREATE INDEX "analytics_draft_id_idx" ON "analytics" USING btree ("draft_id");--> statement-breakpoint
CREATE INDEX "analytics_platform_idx" ON "analytics" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "analytics_recorded_at_idx" ON "analytics" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "draft_versions_draft_id_idx" ON "draft_versions" USING btree ("draft_id");--> statement-breakpoint
CREATE INDEX "draft_versions_created_at_idx" ON "draft_versions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "drafts_user_id_idx" ON "drafts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "drafts_status_idx" ON "drafts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "drafts_created_at_idx" ON "drafts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "platform_posts_draft_id_idx" ON "platform_posts" USING btree ("draft_id");--> statement-breakpoint
CREATE INDEX "platform_posts_platform_idx" ON "platform_posts" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "platform_posts_status_idx" ON "platform_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "integrations_user_id_idx" ON "integrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "integrations_platform_idx" ON "integrations" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "integrations_status_idx" ON "integrations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scheduled_posts_draft_id_idx" ON "scheduled_posts" USING btree ("draft_id");--> statement-breakpoint
CREATE INDEX "scheduled_posts_user_id_idx" ON "scheduled_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scheduled_posts_scheduled_at_idx" ON "scheduled_posts" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "scheduled_posts_status_idx" ON "scheduled_posts" USING btree ("status");