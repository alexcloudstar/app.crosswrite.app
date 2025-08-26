import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { drafts } from './drafts';

export const analytics = pgTable(
  'analytics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    draftId: uuid('draft_id')
      .notNull()
      .references(() => drafts.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(),
    reads: integer('reads').default(0),
    reactions: integer('reactions').default(0),
    clicks: integer('clicks').default(0),
    shares: integer('shares').default(0),
    recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  },
  table => ({
    draftIdIdx: index('analytics_draft_id_idx').on(table.draftId),
    platformIdx: index('analytics_platform_idx').on(table.platform),
    recordedAtIdx: index('analytics_recorded_at_idx').on(table.recordedAt),
  })
);
