import { db } from '@/db/client';
import { userUsage } from '@/db/schema/user-usage';
import { billingSubscriptions } from '@/db/schema/billing';
import { eq, and } from 'drizzle-orm';
import { getPlanCap } from './plans';
import { PLAN_VALUES } from '@/lib/plans';

export type UsageMetric =
  | 'articlesPublished'
  | 'thumbnailsGenerated'
  | 'aiSuggestionsUsed';

export type UsageResult = {
  allowed: boolean;
  warning?: string;
  current: number;
  limit: number;
};

export async function getUserPlanId(userId: string): Promise<string> {
  const subscription = await db
    .select({ planPriceId: billingSubscriptions.planPriceId })
    .from(billingSubscriptions)
    .where(
      and(
        eq(billingSubscriptions.userId, userId),
        eq(billingSubscriptions.status, 'active')
      )
    )
    .limit(1);

  if (subscription[0]) {
    const { getPlanFromPriceId } = await import('./plans');
    return getPlanFromPriceId(subscription[0].planPriceId) || PLAN_VALUES.FREE;
  }

  return PLAN_VALUES.FREE;
}

export async function checkUsageLimit(
  userId: string,
  metric: UsageMetric,
  increment: number = 1
): Promise<UsageResult> {
  const planId = await getUserPlanId(userId);
  const limit = getPlanCap(planId, metric);

  if (limit === Infinity) {
    return { allowed: true, current: 0, limit: Infinity };
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  const usageRecord = await db
    .select({ [metric]: userUsage[metric] })
    .from(userUsage)
    .where(
      and(eq(userUsage.userId, userId), eq(userUsage.monthYear, currentMonth))
    )
    .limit(1);

  const current = (usageRecord[0]?.[metric] || 0) + increment;
  const allowed = current <= limit;

  let warning: string | undefined;
  if (current > limit * 0.8 && current <= limit) {
    warning = `You're approaching your ${metric} limit (${current}/${limit})`;
  }

  return { allowed, warning, current, limit };
}

export async function incrementUsage(
  userId: string,
  metric: UsageMetric,
  increment: number = 1
): Promise<void> {
  const currentMonth = new Date().toISOString().slice(0, 7);

  await db
    .insert(userUsage)
    .values({
      userId,
      monthYear: currentMonth,
      [metric]: increment,
    })
    .onConflictDoUpdate({
      target: [userUsage.userId, userUsage.monthYear],
      set: {
        [metric]: increment,
        updatedAt: new Date(),
      },
    });
}

export async function assertWithinLimits(
  userId: string,
  metric: UsageMetric,
  increment: number = 1
): Promise<{ allowed: boolean; warning?: string }> {
  const result = await checkUsageLimit(userId, metric, increment);

  if (result.allowed) {
    await incrementUsage(userId, metric, increment);
  }

  return { allowed: result.allowed, warning: result.warning };
}
