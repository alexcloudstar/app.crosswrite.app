export interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'feature' | 'update' | 'announcement';
  link?: string;
  detailedDescription?: string;
  tags?: string[];
}

export interface NewsItemSummary {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'feature' | 'update' | 'announcement';
  link?: string;
}
