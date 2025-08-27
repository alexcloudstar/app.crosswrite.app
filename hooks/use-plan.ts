import { useAppStore } from '@/lib/store';
import {
  type PlanId,
  type UserPlan,
  type UserUsage,
  PlanIdEnum,
  canUseAI,
  canGenerateThumbnail,
  canPublishArticle,
  getUsageStatus,
  isProPlan,
  isFreePlan,
  isSelfHostedPlan,
  getUpgradeablePlans,
  getDowngradeablePlans,
  getPlanDisplayName,
  getPlanColor,
  PLAN_PRICING,
  PLAN_FEATURES,
} from '@/lib/plans';

export function usePlan() {
  const {
    userPlan,
    setUserPlan,
    incrementArticleUsage,
    incrementThumbnailUsage,
  } = useAppStore();

  // Plan checking utilities
  const canUseAIFeatures = () => canUseAI(userPlan.planId);
  const canGenerateThumbnails = () =>
    canGenerateThumbnail(userPlan.planId, userPlan.usage);
  const canPublishArticles = () =>
    canPublishArticle(userPlan.planId, userPlan.usage);
  const getUsage = () => getUsageStatus(userPlan.planId, userPlan.usage);

  // Plan comparison utilities
  const isPro = () => isProPlan(userPlan.planId);
  const isFree = () => isFreePlan(userPlan.planId);
  const isSelfHosted = () => isSelfHostedPlan(userPlan.planId);

  // Plan upgrade/downgrade utilities
  const getAvailableUpgrades = () => getUpgradeablePlans(userPlan.planId);
  const getAvailableDowngrades = () => getDowngradeablePlans(userPlan.planId);

  // Plan display utilities
  const getDisplayName = () => getPlanDisplayName(userPlan.planId);
  const getColor = () => getPlanColor(userPlan.planId);
  const getPricing = () =>
    PLAN_PRICING[userPlan.planId as keyof typeof PLAN_PRICING];
  const getFeatures = () =>
    PLAN_FEATURES[userPlan.planId as keyof typeof PLAN_FEATURES];

  // Plan management
  const updatePlan = (planId: PlanId) => setUserPlan({ planId });
  const updateUsage = (usage: Partial<UserUsage>) =>
    setUserPlan({ usage: { ...userPlan.usage, ...usage } });

  return {
    // Current plan state
    userPlan,
    planId: userPlan.planId,
    usage: userPlan.usage,

    // Plan checking
    canUseAIFeatures,
    canGenerateThumbnails,
    canPublishArticles,
    getUsage,

    // Plan comparison
    isPro,
    isFree,
    isSelfHosted,

    // Plan upgrade/downgrade
    getAvailableUpgrades,
    getAvailableDowngrades,

    // Plan display
    getDisplayName,
    getColor,
    getPricing,
    getFeatures,

    // Plan management
    updatePlan,
    updateUsage,
    incrementArticleUsage,
    incrementThumbnailUsage,

    // Constants
    PlanId: PlanIdEnum,
  };
}
