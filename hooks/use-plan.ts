import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getUserPlanData } from '@/app/actions/user-plan';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
  type PlanId,
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
import logger from '@/lib/logger';

export function usePlan() {
  const { data: session } = useSession();
  const {
    userPlan,
    setUserPlan,
    incrementArticleUsage,
    incrementThumbnailUsage,
  } = useAppStore();

  useEffect(() => {
    if (session?.userPlan) {
      setUserPlan(session.userPlan);
      return;
    }

    async function fetchUserPlan() {
      try {
        const result = await getUserPlanData();
        if (result.success && result.data) {
          setUserPlan(result.data);
        }
      } catch {
        toast.error('Failed to fetch user plan');
        logger.error('Failed to fetch user plan');
      }
    }

    if (session?.user?.id) {
      fetchUserPlan();
    }
  }, [session, setUserPlan]);

  const refreshPlanData = async () => {
    try {
      const result = await getUserPlanData();
      if (result.success && result.data) {
        setUserPlan(result.data);
      }
    } catch {
      toast.error('Failed to fetch user plan');
      logger.error('Failed to fetch user plan');
    }
  };

  const canUseAIFeatures = () => canUseAI(userPlan.planId);
  const canGenerateThumbnails = () =>
    canGenerateThumbnail(userPlan.planId, userPlan.usage);
  const canPublishArticles = () =>
    canPublishArticle(userPlan.planId, userPlan.usage);
  const getUsage = () => getUsageStatus(userPlan.planId, userPlan.usage);

  const isPro = () => isProPlan(userPlan.planId);
  const isFree = () => isFreePlan(userPlan.planId);
  const isSelfHosted = () => isSelfHostedPlan(userPlan.planId);

  const getAvailableUpgrades = () => getUpgradeablePlans(userPlan.planId);
  const getAvailableDowngrades = () => getDowngradeablePlans(userPlan.planId);

  const getDisplayName = () => getPlanDisplayName(userPlan.planId);
  const getColor = () => getPlanColor(userPlan.planId);
  const getPricing = () =>
    PLAN_PRICING[userPlan.planId as keyof typeof PLAN_PRICING];
  const getFeatures = () =>
    PLAN_FEATURES[userPlan.planId as keyof typeof PLAN_FEATURES];

  const updatePlan = (planId: PlanId) => setUserPlan({ planId });
  const updateUsage = (usage: Partial<UserUsage>) =>
    setUserPlan({ usage: { ...userPlan.usage, ...usage } });

  return {
    userPlan,
    planId: userPlan.planId,
    usage: userPlan.usage,

    canUseAIFeatures,
    canGenerateThumbnails,
    canPublishArticles,
    getUsage,

    isPro,
    isFree,
    isSelfHosted,

    getAvailableUpgrades,
    getAvailableDowngrades,

    getDisplayName,
    getColor,
    getPricing,
    getFeatures,

    updatePlan,
    updateUsage,
    incrementArticleUsage,
    incrementThumbnailUsage,
    refreshPlanData,

    PlanId: PlanIdEnum,
  };
}
