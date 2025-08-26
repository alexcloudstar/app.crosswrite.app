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

export const draftVersions = pgTable(
  'draft_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    draftId: uuid('draft_id')
      .notNull()
      .references(() => drafts.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    createdBy: text('created_by').references(() => users.id),
  },
  table => [
    index('draft_versions_draft_id_idx').on(table.draftId),
    index('draft_versions_created_at_idx').on(table.createdAt),
  ]
);
