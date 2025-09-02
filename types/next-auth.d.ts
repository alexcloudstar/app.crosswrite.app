import NextAuth from 'next-auth';
import { UserPlan } from '@/lib/plans';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      planTier: string;
    };
    userPlan: UserPlan;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    planTier: string;
  }
}
