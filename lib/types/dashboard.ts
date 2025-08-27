import { Draft } from './drafts';

export type { Draft };

export interface AnalyticsData {
  reads: number;
  engagement: number;
  followers: number;
}

export interface ReadsData {
  date: string;
  value: number;
}

export interface DashboardStats {
  drafts: number;
  scheduled: number;
  published7Days: number;
  published30Days: number;
}
