import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

export const drafts = pgTable(
  'drafts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    contentPreview: text('content_preview'),
    status: text('status').notNull().default('draft'),
    platforms: text('platforms').array().default([]),
    thumbnailUrl: text('thumbnail_url'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    tags: text('tags').array().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    publishedAt: timestamp('published_at'),
    scheduledAt: timestamp('scheduled_at'),
  },
  table => [
    index('drafts_user_id_idx').on(table.userId),
    index('drafts_status_idx').on(table.status),
    index('drafts_created_at_idx').on(table.createdAt),
  ]
);
