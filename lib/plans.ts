export enum PlanId {
  SELF_HOSTED = 'SELF_HOSTED',
  FREE = 'FREE',
  PRO = 'PRO',
}

export enum DatabasePlanTier {
  FREE = 'free',
  PRO = 'pro',
}

export type MonthlyLimit = number | 'UNLIMITED';

export type PlanLimits = {
  aiEnabled: boolean;
  monthlyArticles: MonthlyLimit;
  monthlyThumbGen: number;
  maxPlatforms: number | 'ALL';
};

export type UserUsage = {
  articlesThisMonth: number;
  thumbnailsThisMonth: number;
};

export type UserPlan = {
  planId: PlanId;
  usage: UserUsage;
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  [PlanId.SELF_HOSTED]: {
    aiEnabled: false,
    monthlyArticles: 'UNLIMITED',
    monthlyThumbGen: 0,
    maxPlatforms: 'ALL',
  },
  [PlanId.FREE]: {
    aiEnabled: true,
    monthlyArticles: 5,
    monthlyThumbGen: 3,
    maxPlatforms: 1,
  },
  [PlanId.PRO]: {
    aiEnabled: true,
    monthlyArticles: 200,
    monthlyThumbGen: 50,
    maxPlatforms: 'ALL',
  },
};

export const PLAN_PRICING = {
  [PlanId.FREE]: '$0 / mo',
  [PlanId.PRO]: '$14 / mo',
} as const;

export const PLAN_FEATURES = {
  [PlanId.FREE]: [
    '1 platform',
    '5 articles/month',
    '3 AI thumbnails/month',
    'AI provided by Cross Write',
    'Basic analytics',
  ],
  [PlanId.PRO]: [
    'All platforms',
    '200 AI articles/month',
    '50 AI thumbnails/month',
    'AI provided by Cross Write',
    'Advanced analytics',
    'Priority support',
    'Custom scheduling',
  ],
} as const;

// Plan conversion utilities
export function databasePlanToPlanId(planTier: DatabasePlanTier): PlanId {
  const planMap: Record<DatabasePlanTier, PlanId> = {
    [DatabasePlanTier.FREE]: PlanId.FREE,
    [DatabasePlanTier.PRO]: PlanId.PRO,
  };
  return planMap[planTier] || PlanId.FREE;
}

export function planIdToDatabasePlan(planId: PlanId): DatabasePlanTier {
  const planMap: Record<PlanId, DatabasePlanTier> = {
    [PlanId.FREE]: DatabasePlanTier.FREE,
    [PlanId.PRO]: DatabasePlanTier.PRO,
    [PlanId.SELF_HOSTED]: DatabasePlanTier.FREE, // Default to free for self-hosted
  };
  return planMap[planId];
}

// Plan display utilities
export function getPlanDisplayName(planId: PlanId): string {
  const names: Record<PlanId, string> = {
    [PlanId.FREE]: 'Free',
    [PlanId.PRO]: 'Pro',
    [PlanId.SELF_HOSTED]: 'Self-hosted',
  };
  return names[planId];
}

export function getPlanColor(planId: PlanId): string {
  const colors: Record<PlanId, string> = {
    [PlanId.FREE]: 'bg-base-300 text-base-content',
    [PlanId.PRO]: 'bg-primary text-primary-content',
    [PlanId.SELF_HOSTED]: 'bg-secondary text-secondary-content',
  };
  return colors[planId];
}

// Plan checking utilities
export function canUseAI(planId: PlanId): boolean {
  const limits = PLAN_LIMITS[planId];
  return limits.aiEnabled;
}

export function canGenerateThumbnail(
  planId: PlanId,
  usage: UserUsage
): boolean {
  const limits = PLAN_LIMITS[planId];

  if (!limits.aiEnabled) return false;
  if (limits.monthlyThumbGen === 0) return false;

  return usage.thumbnailsThisMonth < limits.monthlyThumbGen;
}

export function canPublishArticle(planId: PlanId, usage: UserUsage): boolean {
  const limits = PLAN_LIMITS[planId];

  if (limits.monthlyArticles === 'UNLIMITED') return true;

  if (typeof limits.monthlyArticles === 'number') {
    return usage.articlesThisMonth < limits.monthlyArticles;
  }

  return true;
}

export function canUseAIFeature(
  planId: PlanId,
  feature: 'aiSuggestionsUsed' | 'thumbnailsGenerated'
): boolean {
  const limits = PLAN_LIMITS[planId];

  if (!limits.aiEnabled) return false;

  if (feature === 'thumbnailsGenerated' && limits.monthlyThumbGen === 0) {
    return false;
  }

  return true;
}

// Usage status utilities
export function getUsageStatus(planId: PlanId, usage: UserUsage) {
  const limits = PLAN_LIMITS[planId];

  return {
    articles: {
      used: usage.articlesThisMonth,
      limit: limits.monthlyArticles,
    },
    thumbnails: {
      used: usage.thumbnailsThisMonth,
      limit: limits.monthlyThumbGen,
    },
  };
}

// Plan comparison utilities
export function isProPlan(planId: PlanId): boolean {
  return planId === PlanId.PRO;
}

export function isFreePlan(planId: PlanId): boolean {
  return planId === PlanId.FREE;
}

export function isSelfHostedPlan(planId: PlanId): boolean {
  return planId === PlanId.SELF_HOSTED;
}

// Plan upgrade/downgrade utilities
export function getUpgradeablePlans(currentPlanId: PlanId): PlanId[] {
  switch (currentPlanId) {
    case PlanId.FREE:
      return [PlanId.PRO];
    case PlanId.PRO:
      return [];
    case PlanId.SELF_HOSTED:
      return [PlanId.PRO];
    default:
      return [PlanId.PRO];
  }
}

export function getDowngradeablePlans(currentPlanId: PlanId): PlanId[] {
  switch (currentPlanId) {
    case PlanId.FREE:
      return [];
    case PlanId.PRO:
      return [PlanId.FREE];
    case PlanId.SELF_HOSTED:
      return [PlanId.FREE];
    default:
      return [PlanId.FREE];
  }
}
