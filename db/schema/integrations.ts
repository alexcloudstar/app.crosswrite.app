import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

export const integrations = pgTable(
  'integrations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(),
    apiKey: text('api_key'),
    apiSecret: text('api_secret'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    webhookUrl: text('webhook_url'),
    publicationId: text('publication_id'),
    status: text('status').notNull().default('disconnected'),
    autoPublish: boolean('auto_publish').default(false),
    syncInterval: integer('sync_interval').default(60),
    connectedAt: timestamp('connected_at'),
    lastSync: timestamp('last_sync'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('integrations_user_id_idx').on(table.userId),
    index('integrations_platform_idx').on(table.platform),
    index('integrations_status_idx').on(table.status),
    index('integrations_user_platform_status_idx').on(
      table.userId,
      table.platform,
      table.status
    ),
  ]
);
