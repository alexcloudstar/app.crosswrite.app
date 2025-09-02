import { Draft } from './drafts';

export type { Draft };

export type DashboardStats = {
  drafts: number;
  scheduled: number;
  published7Days: number;
  published30Days: number;
};
