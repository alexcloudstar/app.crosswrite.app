'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';

const PlanInitializer = () => {
  const { data: session } = useSession();
  const { setUserPlan } = useAppStore();

  useEffect(() => {
    if (session?.userPlan) {
      setUserPlan(session.userPlan);
    }
  }, [session?.userPlan, setUserPlan]);

  return null;
};

export default PlanInitializer;
