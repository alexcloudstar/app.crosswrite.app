export const PLAN_VALUES = {
  FREE: 'free',
  PRO: 'pro',
  SELF_HOSTED: 'self_hosted',
} as const;

export const DATABASE_PLAN_VALUES = {
  FREE: 'free',
  PRO: 'pro',
} as const;

export type PlanId = (typeof PLAN_VALUES)[keyof typeof PLAN_VALUES];
export type DatabasePlanTier =
  (typeof DATABASE_PLAN_VALUES)[keyof typeof DATABASE_PLAN_VALUES];

export enum PlanIdEnum {
  SELF_HOSTED = 'self_hosted',
  FREE = 'free',
  PRO = 'pro',
}

export enum DatabasePlanTierEnum {
  FREE = 'free',
  PRO = 'pro',
}

export type UppercaseString<T extends string> = Uppercase<T>;
export type LowercaseString<T extends string> = Lowercase<T>;

export type PlanIdToDatabase = UppercaseString<PlanId>;
export type DatabaseToPlanId = PlanId;

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
  [PLAN_VALUES.SELF_HOSTED]: {
    aiEnabled: false,
    monthlyArticles: 'UNLIMITED',
    monthlyThumbGen: 0,
    maxPlatforms: 'ALL',
  },
  [PLAN_VALUES.FREE]: {
    aiEnabled: true,
    monthlyArticles: 5,
    monthlyThumbGen: 3,
    maxPlatforms: 1,
  },
  [PLAN_VALUES.PRO]: {
    aiEnabled: true,
    monthlyArticles: 200,
    monthlyThumbGen: 50,
    maxPlatforms: 'ALL',
  },
};

export const PLAN_PRICING = {
  [PLAN_VALUES.FREE]: '$0 / mo',
  [PLAN_VALUES.PRO]: '$14 / mo',
} as const;

export const PLAN_FEATURES = {
  [PLAN_VALUES.FREE]: [
    '1 platform',
    '5 articles/month',
    '3 AI thumbnails/month',
    'AI provided by Cross Write',
  ],
  [PLAN_VALUES.PRO]: [
    'All platforms',
    '200 AI articles/month',
    '50 AI thumbnails/month',
    'AI provided by Cross Write',
    'Priority support',
    'Custom scheduling',
  ],
} as const;

export function databasePlanToPlanId(planTier: DatabasePlanTier): PlanId {
  const planMap: Record<DatabasePlanTier, PlanId> = {
    [DATABASE_PLAN_VALUES.FREE]: PLAN_VALUES.FREE,
    [DATABASE_PLAN_VALUES.PRO]: PLAN_VALUES.PRO,
  };
  return planMap[planTier] || PLAN_VALUES.FREE;
}

export function planIdToDatabasePlan(planId: PlanId): DatabasePlanTier {
  const planMap: Record<PlanId, DatabasePlanTier> = {
    [PLAN_VALUES.FREE]: DATABASE_PLAN_VALUES.FREE,
    [PLAN_VALUES.PRO]: DATABASE_PLAN_VALUES.PRO,
    [PLAN_VALUES.SELF_HOSTED]: DATABASE_PLAN_VALUES.FREE,
  };
  return planMap[planId];
}

export function getPlanDisplayName(planId: PlanId): string {
  const names: Record<PlanId, string> = {
    [PLAN_VALUES.FREE]: 'Free',
    [PLAN_VALUES.PRO]: 'Pro',
    [PLAN_VALUES.SELF_HOSTED]: 'Self-hosted',
  };
  return names[planId];
}

export function getPlanColor(planId: PlanId): string {
  const colors: Record<PlanId, string> = {
    [PLAN_VALUES.FREE]: 'bg-base-300 text-base-content',
    [PLAN_VALUES.PRO]: 'bg-primary text-primary-content',
    [PLAN_VALUES.SELF_HOSTED]: 'bg-secondary text-secondary-content',
  };
  return colors[planId];
}

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

export function isProPlan(planId: PlanId): boolean {
  return planId === PLAN_VALUES.PRO;
}

export function isFreePlan(planId: PlanId): boolean {
  return planId === PLAN_VALUES.FREE;
}

export function isSelfHostedPlan(planId: PlanId): boolean {
  return planId === PLAN_VALUES.SELF_HOSTED;
}

export function getUpgradeablePlans(currentPlanId: PlanId): PlanId[] {
  switch (currentPlanId) {
    case PLAN_VALUES.FREE:
      return [PLAN_VALUES.PRO];
    case PLAN_VALUES.PRO:
      return [];
    case PLAN_VALUES.SELF_HOSTED:
      return [PLAN_VALUES.PRO];
    default:
      return [PLAN_VALUES.PRO];
  }
}

export function getDowngradeablePlans(currentPlanId: PlanId): PlanId[] {
  switch (currentPlanId) {
    case PLAN_VALUES.FREE:
      return [];
    case PLAN_VALUES.PRO:
      return [PLAN_VALUES.FREE];
    case PLAN_VALUES.SELF_HOSTED:
      return [PLAN_VALUES.FREE];
    default:
      return [PLAN_VALUES.FREE];
  }
}
