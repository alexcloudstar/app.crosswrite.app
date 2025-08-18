export type PlanId = 'SELF_HOSTED' | 'FREE' | 'PRO';

export type MonthlyLimit = number | 'UNLIMITED';

export type PlanLimits = {
  aiEnabled: boolean;
  allowBYOK: boolean;
  monthlyArticles: MonthlyLimit;
  monthlyThumbGen: number;
  maxPlatforms: number | 'ALL';
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  SELF_HOSTED: {
    aiEnabled: false,
    allowBYOK: true,
    monthlyArticles: 'UNLIMITED',
    monthlyThumbGen: 0,
    maxPlatforms: 'ALL',
  },
  FREE: {
    aiEnabled: true,
    allowBYOK: true,
    monthlyArticles: 5,
    monthlyThumbGen: 3,
    maxPlatforms: 1,
  },
  PRO: {
    aiEnabled: true,
    allowBYOK: false,
    monthlyArticles: 200,
    monthlyThumbGen: 50,
    maxPlatforms: 'ALL',
  },
};

export const PLAN_PRICING = {
  FREE: '$0 / mo',
  PRO: '$14 / mo',
} as const;

export const PLAN_FEATURES = {
  FREE: [
    '1 platform',
    '5 articles/month',
    '3 AI thumbnails/month',
    'AI requires BYOK',
    'Basic analytics',
  ],
  PRO: [
    'All platforms',
    '200 AI articles/month',
    '50 AI thumbnails/month',
    'AI provided by Cross Write',
    'Advanced analytics',
    'Priority support',
    'Custom scheduling',
  ],
} as const;

export function getPlanDisplayName(planId: PlanId): string {
  const names: Record<PlanId, string> = {
    FREE: 'Free',
    PRO: 'Pro',
    SELF_HOSTED: 'Self-hosted',
  };
  return names[planId];
}

export function getPlanColor(planId: PlanId): string {
  const colors: Record<PlanId, string> = {
    FREE: 'bg-base-300 text-base-content',
    PRO: 'bg-primary text-primary-content',
    SELF_HOSTED: 'bg-secondary text-secondary-content',
  };
  return colors[planId];
}
