import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { db } from './db/client';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
} from './db/schema/auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    ...(process.env.RESEND_API_KEY
      ? [
          Resend({
            apiKey: process.env.RESEND_API_KEY,
            from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
});
