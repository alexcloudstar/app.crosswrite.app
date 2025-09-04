import { create } from 'zustand';
import {
  type UserPlan,
  PlanIdEnum,
  canUseAI,
  canGenerateThumbnail,
  canPublishArticle,
  getUsageStatus,
} from './plans';

type AppState = {
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
    thumbnails: { used: number; limit: number | 'UNLIMITED' };
  };
};

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
    planId: PlanIdEnum.FREE,
    usage: {
      articlesThisMonth: 0,
      thumbnailsThisMonth: 0,
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
    return canUseAI(userPlan.planId);
  },

  canGenerateThumbnail: () => {
    const { userPlan } = get();
    return canGenerateThumbnail(userPlan.planId, userPlan.usage);
  },

  canPublishArticle: () => {
    const { userPlan } = get();
    return canPublishArticle(userPlan.planId, userPlan.usage);
  },

  getUsageStatus: () => {
    const { userPlan } = get();
    return getUsageStatus(userPlan.planId, userPlan.usage);
  },
}));
