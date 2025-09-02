import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { drafts } from './drafts';

export const scheduledPosts = pgTable(
  'scheduled_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    draftId: uuid('draft_id')
      .notNull()
      .references(() => drafts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    platforms: text('platforms').array().notNull(),
    scheduledAt: timestamp('scheduled_at').notNull(),
    status: text('status').notNull().default('pending'),
    publishedAt: timestamp('published_at'),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('scheduled_posts_draft_id_idx').on(table.draftId),
    index('scheduled_posts_user_id_idx').on(table.userId),
    index('scheduled_posts_scheduled_at_idx').on(table.scheduledAt),
    index('scheduled_posts_status_idx').on(table.status),
    index('scheduled_posts_user_scheduled_status_idx').on(
      table.userId,
      table.scheduledAt,
      table.status
    ),
    index('scheduled_posts_claim_idx').on(table.status, table.scheduledAt),
  ]
);
