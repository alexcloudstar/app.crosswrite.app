'use client';

import { useState } from 'react';
import { Check, Crown, Loader2 } from 'lucide-react';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { QuotaHint } from '@/components/ui/QuotaHint';
import { usePlan } from '@/hooks/use-plan';
import { PLAN_FEATURES, PLAN_PRICING, PLAN_VALUES } from '@/lib/plans';

export default function BillingPage() {
  const { userPlan, updatePlan, getPricing, isFree, isPro, PlanId } = usePlan();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    // Mock upgrade process
    await new Promise(resolve => setTimeout(resolve, 2000));
    updatePlan(PlanId.PRO);
    setIsUpgrading(false);
  };

  const handleDowngrade = async () => {
    setIsDowngrading(true);
    // Mock downgrade process
    await new Promise(resolve => setTimeout(resolve, 1500));
    updatePlan(PlanId.FREE);
    setIsDowngrading(false);
  };

  const handleManageSubscription = () => {
    // Mock subscription management - in real app this would open a modal or redirect
    alert('Subscription management portal would open here. This is a demo.');
  };

  const features = [
    { name: 'Platforms', free: '1 platform', pro: 'All platforms' },
    { name: 'AI Articles', free: '5/month', pro: '200/month' },
    { name: 'AI Thumbnails', free: '3/month', pro: '50/month' },
    { name: 'AI Provider', free: 'Cross Write', pro: 'Cross Write' },
    { name: 'Analytics', free: 'Basic', pro: 'Advanced' },
    { name: 'Support', free: 'Community', pro: 'Priority' },
    { name: 'Scheduling', free: 'Basic', pro: 'Custom' },
  ];

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Billing & Plans</h1>
        <p className='text-base-content/70'>
          Choose the plan that works best for your content creation needs
        </p>
      </div>

      {/* Current Plan Status */}
      <div className='card bg-base-100 border border-base-300 shadow-sm mb-8'>
        <div className='card-body'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold mb-2'>Current Plan</h2>
              <div className='flex items-center space-x-4'>
                <PlanBadge planId={userPlan.planId} />
                <span className='text-lg font-medium'>
                  {PLAN_PRICING[userPlan.planId as keyof typeof PLAN_PRICING]}
                </span>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <QuotaHint type='articles' />
              <QuotaHint type='thumbnails' />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Free Plan */}
        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body'>
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-bold mb-2'>Free</h3>
              <div className='text-3xl font-bold mb-4'>{getPricing()}</div>
              <p className='text-base-content/70 mb-4'>
                Perfect for getting started with content creation
              </p>
              {isFree() && (
                <div className='badge badge-primary'>Current Plan</div>
              )}
            </div>

            <div className='space-y-3 mb-6'>
              {PLAN_FEATURES[PLAN_VALUES.FREE].map((feature, index) => (
                <div key={index} className='flex items-center space-x-3'>
                  <Check size={16} className='text-success flex-shrink-0' />
                  <span className='text-sm'>{feature}</span>
                </div>
              ))}
            </div>

            {!isFree() && (
              <button
                onClick={handleDowngrade}
                disabled={isDowngrading}
                className='btn btn-outline w-full'
              >
                {isDowngrading ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Downgrading...
                  </>
                ) : (
                  'Downgrade to Free'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Pro Plan */}
        <div className='card bg-primary text-primary-content border border-primary shadow-sm relative'>
          <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
            <div className='badge badge-secondary flex items-center space-x-1'>
              <Crown size={12} />
              <span>Most Popular</span>
            </div>
          </div>
          <div className='card-body'>
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-bold mb-2'>Pro</h3>
              <div className='text-3xl font-bold mb-4'>
                $14<span className='text-lg font-normal'>/month</span>
              </div>
              <p className='text-primary-content/70 mb-4'>
                For serious content creators and teams
              </p>
              {isPro() && (
                <div className='badge badge-secondary'>Current Plan</div>
              )}
            </div>

            <div className='space-y-3 mb-6'>
              {PLAN_FEATURES[PLAN_VALUES.PRO].map((feature, index) => (
                <div key={index} className='flex items-center space-x-3'>
                  <Check
                    size={16}
                    className='text-primary-content flex-shrink-0'
                  />
                  <span className='text-sm'>{feature}</span>
                </div>
              ))}
            </div>

            {!isPro() ? (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className='btn btn-secondary w-full'
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Upgrading...
                  </>
                ) : (
                  'Upgrade to Pro'
                )}
              </button>
            ) : (
              <button
                onClick={handleManageSubscription}
                className='btn bg-white text-primary hover:bg-gray-100 border-white w-full'
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className='card bg-base-100 border border-base-300 shadow-sm mt-8'>
        <div className='card-body'>
          <h3 className='text-xl font-semibold mb-6'>
            Detailed Feature Comparison
          </h3>
          <div className='overflow-x-auto'>
            <table className='table w-full'>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className='text-center'>Free</th>
                  <th className='text-center'>Pro</th>
                </tr>
              </thead>
              <tbody>
                {features.map(feature => (
                  <tr key={feature.name} className='hover:bg-base-200'>
                    <td className='font-medium'>{feature.name}</td>
                    <td className='text-center'>{feature.free}</td>
                    <td className='text-center'>{feature.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className='card bg-base-100 border border-base-300 shadow-sm mt-8'>
        <div className='card-body'>
          <h3 className='text-xl font-semibold mb-6'>
            Frequently Asked Questions
          </h3>
          <div className='space-y-6'>
            <div>
              <h4 className='font-medium mb-2'>How does AI work?</h4>
              <p className='text-sm text-base-content/70'>
                AI features are powered by Cross Write using our server-side API
                keys. This ensures secure, reliable AI generation without
                requiring you to manage your own API keys.
              </p>
            </div>
            <div>
              <h4 className='font-medium mb-2'>Can I change plans anytime?</h4>
              <p className='text-sm text-base-content/70'>
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div>
              <h4 className='font-medium mb-2'>
                What happens to my content if I downgrade?
              </h4>
              <p className='text-sm text-base-content/70'>
                Your existing content remains accessible. You&apos;ll only be
                limited by the new plan&apos;s restrictions for future content
                creation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
