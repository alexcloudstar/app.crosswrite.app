'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { type UserPlan } from '@/lib/plans';

const PlanInitializer = () => {
  const { data: session } = useSession();
  const { setUserPlan } = useAppStore();

  useEffect(() => {
    if (session && 'userPlan' in session) {
      setUserPlan(
        (session as typeof session & { userPlan: UserPlan }).userPlan
      );
    }
  }, [session, setUserPlan]);

  return null;
};

export default PlanInitializer;
