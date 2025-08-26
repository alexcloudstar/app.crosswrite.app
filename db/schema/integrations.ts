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
    status: text('status').notNull().default('disconnected'),
    autoPublish: boolean('auto_publish').default(false),
    syncInterval: integer('sync_interval').default(60),
    connectedAt: timestamp('connected_at'),
    lastSync: timestamp('last_sync'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('integrations_user_id_idx').on(table.userId),
    platformIdx: index('integrations_platform_idx').on(table.platform),
    statusIdx: index('integrations_status_idx').on(table.status),
  })
);
