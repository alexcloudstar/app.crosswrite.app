import { Draft } from './drafts';

export type { Draft };



export interface DashboardStats {
  drafts: number;
  scheduled: number;
  published7Days: number;
  published30Days: number;
}
