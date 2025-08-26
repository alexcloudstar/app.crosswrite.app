import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
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
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    draftIdIdx: index('scheduled_posts_draft_id_idx').on(table.draftId),
    userIdIdx: index('scheduled_posts_user_id_idx').on(table.userId),
    scheduledAtIdx: index('scheduled_posts_scheduled_at_idx').on(
      table.scheduledAt
    ),
    statusIdx: index('scheduled_posts_status_idx').on(table.status),
  })
);
