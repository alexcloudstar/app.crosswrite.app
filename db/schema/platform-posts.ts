import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { drafts } from './drafts';

export const platformPosts = pgTable(
  'platform_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    draftId: uuid('draft_id')
      .notNull()
      .references(() => drafts.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(),
    platformPostId: text('platform_post_id'),
    platformUrl: text('platform_url'),
    status: text('status').notNull().default('pending'),
    publishedAt: timestamp('published_at'),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    draftIdIdx: index('platform_posts_draft_id_idx').on(table.draftId),
    platformIdx: index('platform_posts_platform_idx').on(table.platform),
    statusIdx: index('platform_posts_status_idx').on(table.status),
  })
);
