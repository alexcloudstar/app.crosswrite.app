export type Platform = 'devto' | 'medium' | 'hashnode' | 'beehiiv';
export type DraftStatus = 'draft' | 'scheduled' | 'published';
export type ActivityType =
  | 'draft_created'
  | 'scheduled'
  | 'published'
  | 'integration_connected';

export interface Draft {
  id: string;
  title: string;
  contentPreview: string;
  status: DraftStatus;
  platforms: Platform[];
  updatedAt: Date;
  publishedAt?: Date;
  scheduledAt?: Date;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  platform?: Platform;
}

export interface AnalyticsData {
  reads: number;
  engagement: number;
  followers: number;
  posts: number;
  totalReads: number;
  ctr: number;
  avgReadTime: number;
  platformsReached: number;
  readsOverTime: { date: string; reads: number }[];
  readsByPlatform: { platform: string; reads: number }[];
  publishSuccess: { status: string; count: number }[];
  publishSuccessRate: number;
  topPosts: {
    id: string;
    title: string;
    reads: number;
    reactions: number;
    clicks: number;
    platform: Platform;
    publishDate: Date;
  }[];
}

export interface Integration {
  id: string;
  name: string;
  platform: Platform;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt?: Date;
  lastSync?: Date;
  apiKey?: string;
  webhookUrl?: string;
  autoPublish: boolean;
  syncInterval: number;
}

export const mockDrafts: Draft[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js 15',
    contentPreview:
      'Next.js 15 introduces several exciting new features including the new App Router, improved performance, and better developer experience...',
    status: 'published',
    platforms: ['devto', 'medium'],
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'TypeScript Best Practices for 2024',
    contentPreview:
      "TypeScript has evolved significantly over the years. Here are the best practices I've learned from building large-scale applications...",
    status: 'scheduled',
    platforms: ['devto', 'medium'],
    updatedAt: new Date('2024-01-14'),
    scheduledAt: new Date('2024-01-20T10:00:00'),
  },
  {
    id: '3',
    title: 'Building a Modern SaaS Dashboard',
    contentPreview:
      'Creating a beautiful and functional dashboard is crucial for SaaS applications. Let me share my approach to building modern dashboards...',
    status: 'draft',
    platforms: ['devto', 'medium'],
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: '4',
    title: 'The Future of Web Development',
    contentPreview:
      "Web development is constantly evolving. From AI-powered tools to new frameworks, here's what I think the future holds...",
    status: 'scheduled',
    platforms: ['devto', 'medium'],
    updatedAt: new Date('2024-01-12'),
    scheduledAt: new Date(),
  },
  {
    id: '5',
    title: 'Optimizing React Performance',
    contentPreview:
      'Performance is crucial for React applications. Here are the techniques I use to ensure my React apps are fast and responsive...',
    status: 'published',
    platforms: ['devto', 'medium'],
    updatedAt: new Date('2024-01-11'),
    publishedAt: new Date('2024-01-11'),
  },
  {
    id: '6',
    title: 'Advanced CSS Grid Techniques',
    contentPreview:
      'Master CSS Grid with these advanced techniques that will take your layouts to the next level...',
    status: 'scheduled',
    platforms: ['devto', 'medium'],
    updatedAt: new Date(),
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '7',
    title: 'State Management in React 2024',
    contentPreview:
      'Explore the latest state management solutions for React applications...',
    status: 'scheduled',
    platforms: ['devto', 'medium'],
    updatedAt: new Date(),
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'published',
    title: 'Getting Started with Next.js 15',
    description: 'Published to Twitter, LinkedIn, and Medium',
    timestamp: new Date('2024-01-15T10:30:00'),
    platform: 'devto',
  },
  {
    id: '2',
    type: 'scheduled',
    title: 'TypeScript Best Practices for 2024',
    description: 'Scheduled for January 20, 2024 at 10:00 AM',
    timestamp: new Date('2024-01-14T15:45:00'),
  },
  {
    id: '3',
    type: 'draft_created',
    title: 'Building a Modern SaaS Dashboard',
    description: 'New draft created',
    timestamp: new Date('2024-01-13T09:15:00'),
  },
  {
    id: '4',
    type: 'integration_connected',
    title: 'LinkedIn Integration',
    description: 'Successfully connected LinkedIn account',
    timestamp: new Date('2024-01-12T14:20:00'),
    platform: 'devto',
  },
  {
    id: '5',
    type: 'published',
    title: 'Optimizing React Performance',
    description: 'Published to Twitter, LinkedIn, and Medium',
    timestamp: new Date('2024-01-11T11:00:00'),
    platform: 'devto',
  },
];

export const mockAnalytics: AnalyticsData = {
  reads: 15420,
  engagement: 892,
  followers: 3240,
  posts: 45,
  totalReads: 15420,
  ctr: 3.2,
  avgReadTime: 4.5,
  platformsReached: 4,
  readsOverTime: [
    { date: '2024-01-10', reads: 1200 },
    { date: '2024-01-11', reads: 1350 },
    { date: '2024-01-12', reads: 980 },
    { date: '2024-01-13', reads: 1420 },
    { date: '2024-01-14', reads: 1680 },
    { date: '2024-01-15', reads: 1890 },
  ],
  readsByPlatform: [
    { platform: 'Twitter', reads: 6200 },
    { platform: 'LinkedIn', reads: 4800 },
    { platform: 'Medium', reads: 3200 },
    { platform: 'Dev.to', reads: 1220 },
  ],
  publishSuccess: [
    { status: 'Success', count: 42 },
    { status: 'Failed', count: 3 },
  ],
  publishSuccessRate: 94.2,
  topPosts: [
    {
      id: '1',
      title: 'Getting Started with Next.js 15',
      reads: 3200,
      reactions: 245,
      clicks: 180,
      platform: 'devto',
      publishDate: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'TypeScript Best Practices for 2024',
      reads: 2800,
      reactions: 189,
      clicks: 156,
      platform: 'medium',
      publishDate: new Date('2024-01-14'),
    },
    {
      id: '3',
      title: 'Optimizing React Performance',
      reads: 2100,
      reactions: 156,
      clicks: 98,
      platform: 'medium',
      publishDate: new Date('2024-01-11'),
    },
  ],
};

export const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Medium Blog',
    platform: 'medium',
    status: 'connected',
    connectedAt: new Date('2024-01-08'),
    lastSync: new Date('2024-01-15T10:30:00'),
    autoPublish: false,
    syncInterval: 60,
  },
  {
    id: '2',
    name: 'Dev.to Blog',
    platform: 'hashnode',
    status: 'disconnected',
    autoPublish: false,
    syncInterval: 60,
  },
  {
    id: '3',
    name: 'Hashnode Blog',
    platform: 'hashnode',
    status: 'disconnected',
    autoPublish: false,
    syncInterval: 60,
  },
  {
    id: '4',
    name: 'Beehiiv Newsletter',
    platform: 'beehiiv',
    status: 'disconnected',
    autoPublish: false,
    syncInterval: 60,
  },
];

export function formatDate(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

export function getPlatformDisplayName(platform: string): string {
  const names: Record<string, string> = {
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    medium: 'Medium',
    dev: 'Dev.to',
  };
  return names[platform] || platform;
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    twitter: 'bg-blue-500',
    linkedin: 'bg-blue-600',
    medium: 'bg-green-500',
    dev: 'bg-purple-500',
  };
  return colors[platform] || 'bg-gray-500';
}
