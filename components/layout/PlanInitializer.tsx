'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';

const PlanInitializer = () => {
  const { data: session } = useSession();
  const { setUserPlan } = useAppStore();

  useEffect(() => {
    if (session && 'userPlan' in session) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUserPlan((session as any).userPlan);
    }
  }, [session, setUserPlan]);

  return null;
};

export default PlanInitializer;
