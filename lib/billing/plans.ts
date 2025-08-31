import { PLAN_VALUES } from '@/lib/plans';

const STRIPE_PRICE_IDS = {
  PRO: process.env.STRIPE_PRICE_PRO,
} as const;

export const PLAN_PRICE_MAP = {
  [PLAN_VALUES.PRO]: STRIPE_PRICE_IDS.PRO,
} as const;

export const PRICE_PLAN_MAP = Object.fromEntries(
  Object.entries(PLAN_PRICE_MAP).map(([plan, price]) => [price, plan])
) as Record<string, string>;

export const PLAN_CAPS = {
  [PLAN_VALUES.FREE]: {
    articlesPublished: 5,
    thumbnailsGenerated: 3,
    aiSuggestionsUsed: 500,
  },
  [PLAN_VALUES.PRO]: {
    articlesPublished: 200,
    thumbnailsGenerated: 50,
    aiSuggestionsUsed: 5000,
  },
  [PLAN_VALUES.SELF_HOSTED]: {
    articlesPublished: Infinity,
    thumbnailsGenerated: Infinity,
    aiSuggestionsUsed: Infinity,
  },
} as const;

export function getPlanCap(
  planId: string,
  metric: keyof (typeof PLAN_CAPS)[typeof PLAN_VALUES.FREE]
): number {
  return PLAN_CAPS[planId as keyof typeof PLAN_CAPS]?.[metric] ?? 0;
}

export function getPlanFromPriceId(priceId: string): string | null {
  return PRICE_PLAN_MAP[priceId] || null;
}
