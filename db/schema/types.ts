import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
} from './auth';
import { drafts } from './drafts';
import { draftVersions } from './draft-versions';
import { platformPosts } from './platform-posts';
import { integrations } from './integrations';

import { scheduledPosts } from './scheduled-posts';
import { userUsage } from './user-usage';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;
export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;
export type VerificationToken = InferSelectModel<typeof verificationTokens>;
export type NewVerificationToken = InferInsertModel<typeof verificationTokens>;
export type Authenticator = InferSelectModel<typeof authenticators>;
export type NewAuthenticator = InferInsertModel<typeof authenticators>;

export type Draft = InferSelectModel<typeof drafts>;
export type NewDraft = InferInsertModel<typeof drafts>;
export type DraftVersion = InferSelectModel<typeof draftVersions>;
export type NewDraftVersion = InferInsertModel<typeof draftVersions>;
export type PlatformPost = InferSelectModel<typeof platformPosts>;
export type NewPlatformPost = InferInsertModel<typeof platformPosts>;
export type Integration = InferSelectModel<typeof integrations>;
export type NewIntegration = InferInsertModel<typeof integrations>;

export type ScheduledPost = InferSelectModel<typeof scheduledPosts>;
export type NewScheduledPost = InferInsertModel<typeof scheduledPosts>;
export type UserUsage = InferSelectModel<typeof userUsage>;
export type NewUserUsage = InferInsertModel<typeof userUsage>;
