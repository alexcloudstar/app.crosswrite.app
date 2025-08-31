import { db } from '@/db/client';
import { users } from '@/db/schema/auth';
import { userUsage } from '@/db/schema/user-usage';
import { getUserPlanId } from '@/lib/billing/usage';
import { and, eq } from 'drizzle-orm';
import {
  type PlanId,
  type UserPlan,
  type UserUsage,
  canGenerateThumbnail,
  canPublishArticle,
  canUseAI,
  canUseAIFeature,
  DatabasePlanTierEnum,
  getDowngradeablePlans,
  getUpgradeablePlans,
  getUsageStatus,
  isFreePlan,
  isProPlan,
  planIdToDatabasePlan,
} from './plans';

export class PlanService {
  static async getUserPlan(userId: string): Promise<UserPlan> {
    const planId = await getUserPlanId(userId);

    const currentMonth = new Date().toISOString().slice(0, 7);

    const usageRecord = await db
      .select({
        articlesPublished: userUsage.articlesPublished,
        thumbnailsGenerated: userUsage.thumbnailsGenerated,
      })
      .from(userUsage)
      .where(
        and(eq(userUsage.userId, userId), eq(userUsage.monthYear, currentMonth))
      )
      .limit(1);

    const usage: UserUsage = {
      articlesThisMonth: usageRecord[0]?.articlesPublished || 0,
      thumbnailsThisMonth: usageRecord[0]?.thumbnailsGenerated || 0,
    };

    return {
      planId: planId as PlanId,
      usage,
    };
  }

  static async updateUserPlan(userId: string, planId: PlanId): Promise<void> {
    const planTier = planIdToDatabasePlan(planId);

    await db
      .update(users)
      .set({ planTier: planTier as DatabasePlanTierEnum })
      .where(eq(users.id, userId));
  }

  static async canUserUseAI(userId: string): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId);
    return canUseAI(userPlan.planId);
  }

  static async canUserGenerateThumbnail(userId: string): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId);
    return canGenerateThumbnail(userPlan.planId, userPlan.usage);
  }

  static async canUserPublishArticle(userId: string): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId);
    return canPublishArticle(userPlan.planId, userPlan.usage);
  }

  static async canUserUseAIFeature(
    userId: string,
    feature: 'aiSuggestionsUsed' | 'thumbnailsGenerated'
  ): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId);
    return canUseAIFeature(userPlan.planId, feature);
  }

  static async getUserUsageStatus(userId: string) {
    const userPlan = await this.getUserPlan(userId);
    return getUsageStatus(userPlan.planId, userPlan.usage);
  }

  static async isUserPro(userId: string): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId);
    return isProPlan(userPlan.planId);
  }

  static async isUserFree(userId: string): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId);
    return isFreePlan(userPlan.planId);
  }

  static async getAvailableUpgrades(userId: string): Promise<PlanId[]> {
    const userPlan = await this.getUserPlan(userId);
    return getUpgradeablePlans(userPlan.planId);
  }

  static async getAvailableDowngrades(userId: string): Promise<PlanId[]> {
    const userPlan = await this.getUserPlan(userId);
    return getDowngradeablePlans(userPlan.planId);
  }

  static async validatePlanTransition(
    userId: string,
    newPlanId: PlanId
  ): Promise<{ valid: boolean; reason?: string }> {
    const userPlan = await this.getUserPlan(userId);
    const currentPlanId = userPlan.planId;

    if (currentPlanId === newPlanId) {
      return { valid: false, reason: 'Already on this plan' };
    }

    const availableUpgrades = getUpgradeablePlans(currentPlanId);
    const availableDowngrades = getDowngradeablePlans(currentPlanId);

    if (availableUpgrades.includes(newPlanId)) {
      return { valid: true };
    }

    if (availableDowngrades.includes(newPlanId)) {
      return { valid: true };
    }

    return { valid: false, reason: 'Invalid plan transition' };
  }
}

export const planService = {
  getUserPlan: PlanService.getUserPlan,
  updateUserPlan: PlanService.updateUserPlan,
  canUserUseAI: PlanService.canUserUseAI,
  canUserGenerateThumbnail: PlanService.canUserGenerateThumbnail,
  canUserPublishArticle: PlanService.canUserPublishArticle,
  canUserUseAIFeature: PlanService.canUserUseAIFeature,
  getUserUsageStatus: PlanService.getUserUsageStatus,
  isUserPro: PlanService.isUserPro,
  isUserFree: PlanService.isUserFree,
  getAvailableUpgrades: PlanService.getAvailableUpgrades,
  getAvailableDowngrades: PlanService.getAvailableDowngrades,
  validatePlanTransition: PlanService.validatePlanTransition,
};
