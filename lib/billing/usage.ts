import { db } from '@/db/client';
import { userUsage } from '@/db/schema/user-usage';
import { billingSubscriptions } from '@/db/schema/billing';
import { eq, and, sql } from 'drizzle-orm';
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

  // Use atomic UPSERT to get current usage and increment atomically
  const [result] = await db
    .insert(userUsage)
    .values({
      userId,
      monthYear: currentMonth,
      [metric]: increment,
    })
    .onConflictDoUpdate({
      target: [userUsage.userId, userUsage.monthYear],
      set: {
        [metric]: sql`${userUsage[metric]} + ${increment}`,
        updatedAt: new Date(),
      },
    })
    .returning({ [metric]: userUsage[metric] });

  const current = result[metric];
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

  // Atomic UPSERT pattern for usage increment
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
        [metric]: sql`${userUsage[metric]} + ${increment}`,
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
    // Usage already incremented in checkUsageLimit
    return { allowed: true, warning: result.warning };
  }

  return { allowed: false, warning: result.warning };
}

// Optimized bulk usage check and increment
export async function checkAndIncrementBulkUsage(
  userId: string,
  metrics: Array<{ metric: UsageMetric; increment: number }>
): Promise<{ allowed: boolean; warnings: string[]; exceededMetrics: UsageMetric[] }> {
  const planId = await getUserPlanId(userId);
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const warnings: string[] = [];
  const exceededMetrics: UsageMetric[] = [];
  let allAllowed = true;

  // Check all metrics first
  for (const { metric, increment } of metrics) {
    const limit = getPlanCap(planId, metric);
    if (limit === Infinity) continue;

    const currentUsage = await db
      .select({ [metric]: userUsage[metric] })
      .from(userUsage)
      .where(
        and(eq(userUsage.userId, userId), eq(userUsage.monthYear, currentMonth))
      )
      .limit(1);

    const current = (currentUsage[0]?.[metric] || 0) + increment;
    if (current > limit) {
      allAllowed = false;
      exceededMetrics.push(metric);
    } else if (current > limit * 0.8) {
      warnings.push(`Approaching ${metric} limit (${current}/${limit})`);
    }
  }

  if (allAllowed) {
    // Increment all metrics atomically
    for (const { metric, increment } of metrics) {
      await incrementUsage(userId, metric, increment);
    }
  }

  return { allowed: allAllowed, warnings, exceededMetrics };
}
