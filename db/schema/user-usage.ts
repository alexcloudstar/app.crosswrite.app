import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

export const userUsage = pgTable(
  'user_usage',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    monthYear: text('month_year').notNull(),
    articlesPublished: integer('articles_published').default(0),
    thumbnailsGenerated: integer('thumbnails_generated').default(0),
    aiSuggestionsUsed: integer('ai_suggestions_used').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    userMonthYearIdx: uniqueIndex('user_month_year_idx').on(
      table.userId,
      table.monthYear
    ),
  })
);
