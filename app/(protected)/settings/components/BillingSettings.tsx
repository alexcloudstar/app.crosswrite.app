'use client';

import { PlanBadge } from '@/components/ui/PlanBadge';
import { useAppStore } from '@/lib/store';
import { PlanIdEnum } from '@/lib/plans';

export function BillingSettings() {
  const { userPlan } = useAppStore();

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Billing & Plan Settings</h2>
        <div className='space-y-4'>
          <div className='flex flex-col gap-2'>
            <label className='label'>
              <span className='label-text'>Current Plan</span>
            </label>
            <div className='flex items-center space-x-2'>
              <PlanBadge planId={userPlan.planId} />
              <span className='text-sm text-base-content/50'>
                {userPlan.planId === PlanIdEnum.FREE ? 'Free Plan' : 'Pro Plan'}
              </span>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='label'>
              <span className='label-text'>AI Configuration</span>
            </label>
            <div className='alert alert-info'>
              <span>
                AI features are provided by Cross Write using server-side API
                keys. No additional setup required.
              </span>
            </div>
          </div>

          <div className='flex justify-end'>
            <a href='/settings/billing' className='btn btn-primary'>
              Manage Billing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
