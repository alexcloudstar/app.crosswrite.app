import { db } from '@/db/client';
import { users } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import {
  type PlanId,
  type DatabasePlanTier,
  type UserPlan,
  type UserUsage,
  DatabasePlanTierEnum,
  databasePlanToPlanId,
  planIdToDatabasePlan,
  canUseAI,
  canGenerateThumbnail,
  canPublishArticle,
  canUseAIFeature,
  getUsageStatus,
  isProPlan,
  isFreePlan,
  getUpgradeablePlans,
  getDowngradeablePlans,
} from './plans';

export class PlanService {
  static async getUserPlan(userId: string): Promise<UserPlan> {
    const userRecord = await db
      .select({ planTier: users.planTier })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const planTier = (userRecord[0]?.planTier ||
      DatabasePlanTierEnum.FREE) as DatabasePlanTier;
    const planId = databasePlanToPlanId(planTier);

    // TODO: Get actual usage from database
    // For now, return default usage
    const usage: UserUsage = {
      articlesThisMonth: 0,
      thumbnailsThisMonth: 0,
    };

    return {
      planId,
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

// Convenience functions for common operations
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
