'use client';

import { PlanBadge } from '@/components/ui/PlanBadge';
import { DeploymentModeBadge } from '@/components/ui/DeploymentModeBadge';
import { usePlan } from '@/hooks/use-plan';
import {
  DeploymentConfig,
  getDeploymentConfig,
} from '@/lib/actions/deploymentConfig';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function BillingSettings() {
  const { userPlan } = usePlan();
  const [deploymentConfig, setDeploymentConfig] =
    useState<DeploymentConfig | null>(null);

  useEffect(() => {
    const fetchDeploymentConfig = async () => {
      const config = await getDeploymentConfig();
      if (config) {
        setDeploymentConfig(config);
      }
    };
    fetchDeploymentConfig();
  }, []);

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Billing & Plan Settings</h2>
        <div className='space-y-4'>
          {deploymentConfig?.mode === 'HOSTED' && (
            <div className='flex flex-col gap-2'>
              <label className='label'>
                <span className='label-text'>Current Plan</span>
              </label>
              <div className='flex items-center space-x-2'>
                <PlanBadge planId={userPlan.planId} />
              </div>
            </div>
          )}

          <div className='flex flex-col gap-2'>
            <label className='label'>
              <span className='label-text'>AI Configuration</span>
            </label>
            {deploymentConfig ? (
              <div className='space-y-2'>
                <DeploymentModeBadge
                  mode={deploymentConfig.mode}
                  hasRequiredKey={deploymentConfig.hasRequiredKey}
                />
                {deploymentConfig.hasRequiredKey ? (
                  <div className='alert alert-success'>
                    <span>AI features are enabled and ready to use.</span>
                  </div>
                ) : (
                  <div className='alert alert-warning'>
                    <span>
                      AI features require an OpenAI API key. Set OPENAI_API_KEY
                      in your environment variables to enable AI functionality.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className='loading loading-spinner loading-sm'></div>
            )}
          </div>

          {deploymentConfig?.mode === 'HOSTED' && (
            <div className='flex justify-end'>
              <Link href='/settings/billing' className='btn btn-primary'>
                Manage Billing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
