import { create } from 'zustand';
import { PlanId, PLAN_LIMITS } from './plans';

interface UserPlan {
  planId: PlanId;
  usage: {
    articlesThisMonth: number;
    thumbnailsThisMonth: number;
  };
}

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  userPlan: UserPlan;
  setUserPlan: (plan: Partial<UserPlan>) => void;

  incrementArticleUsage: () => void;
  incrementThumbnailUsage: () => void;

  canUseAI: () => boolean;
  canGenerateThumbnail: () => boolean;
  canPublishArticle: () => boolean;
  getUsageStatus: () => {
    articles: { used: number; limit: number | 'UNLIMITED' };
    thumbnails: { used: number; limit: number };
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: true,
  setSidebarOpen: open => set({ sidebarOpen: open }),
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  userPlan: {
    planId: 'FREE',
    usage: {
      articlesThisMonth: 2,
      thumbnailsThisMonth: 1,
    },
  },

  setUserPlan: plan =>
    set(state => ({
      userPlan: { ...state.userPlan, ...plan },
    })),



  incrementArticleUsage: () =>
    set(state => ({
      userPlan: {
        ...state.userPlan,
        usage: {
          ...state.userPlan.usage,
          articlesThisMonth: state.userPlan.usage.articlesThisMonth + 1,
        },
      },
    })),

  incrementThumbnailUsage: () =>
    set(state => ({
      userPlan: {
        ...state.userPlan,
        usage: {
          ...state.userPlan.usage,
          thumbnailsThisMonth: state.userPlan.usage.thumbnailsThisMonth + 1,
        },
      },
    })),

  canUseAI: () => {
    const { userPlan } = get();
    const limits = PLAN_LIMITS[userPlan.planId];

    if (!limits.aiEnabled) return false;

    return true;
  },

  canGenerateThumbnail: () => {
    const { userPlan } = get();
    const limits = PLAN_LIMITS[userPlan.planId];

    if (!limits.aiEnabled) return false;

    if (limits.monthlyThumbGen === 0) return false;

    if (
      typeof limits.monthlyThumbGen === 'number' &&
      userPlan.usage.thumbnailsThisMonth >= limits.monthlyThumbGen
    ) {
      return false;
    }

    return true;
  },

  canPublishArticle: () => {
    const { userPlan } = get();
    const limits = PLAN_LIMITS[userPlan.planId];

    if (limits.monthlyArticles === 'UNLIMITED') return true;

    if (typeof limits.monthlyArticles === 'number') {
      return userPlan.usage.articlesThisMonth < limits.monthlyArticles;
    }

    return true;
  },

  getUsageStatus: () => {
    const { userPlan } = get();
    const limits = PLAN_LIMITS[userPlan.planId];

    return {
      articles: {
        used: userPlan.usage.articlesThisMonth,
        limit: limits.monthlyArticles,
      },
      thumbnails: {
        used: userPlan.usage.thumbnailsThisMonth,
        limit: limits.monthlyThumbGen,
      },
    };
  },
}));
