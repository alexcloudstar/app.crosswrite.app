export interface AnalyticsOverview {
  reads: number;
  clicks: number;
  reactions: number;
  shares: number;
  ctr: number;
  avgReadTime: number;
  platformsReached: number;
}

export interface ReadsOverTimeData {
  date: string;
  reads: number;
  clicks: number;
  reactions: number;
  shares: number;
}

export interface PlatformBreakdownData {
  platform: string;
  reads: number;
  clicks: number;
  reactions: number;
  shares: number;
}

export interface TopPostData {
  id: string;
  title: string;
  reads: number;
  reactions: number;
  clicks: number;
  platform: string;
  publishDate: string;
}

export interface PublishSuccessData {
  status: string;
  count: number;
}

export interface AnalyticsResponse<T> {
  data: T;
  period: {
    from: string;
    to: string;
    granularity: string;
  };
}
