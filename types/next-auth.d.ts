import NextAuth from 'next-auth';
import { UserPlan } from '@/lib/plans';

declare module 'next-auth' {
  type Session = {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      planTier: string;
    };
    userPlan: UserPlan;
  };

  type User = {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    planTier: string;
  };
}
