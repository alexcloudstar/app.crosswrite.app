export interface NewsItem {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  date: string;
  type: 'feature' | 'update' | 'announcement';
  link?: string;
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

export const CENTRALIZED_UPDATES: NewsItem[] = [
  {
    id: '1',
    title: 'Markdown Editor with AI Suggestions',
    description:
      'Full-featured markdown editor with AI-powered writing assistance and real-time preview.',
    detailedDescription:
      'Our markdown editor provides a clean writing experience with AI-powered suggestions, real-time preview, and comprehensive markdown support. Write content with confidence using our intelligent writing assistant.',
    date: '2025-01-15',
    type: 'feature',
    link: '/editor',
    tags: ['Editor', 'Markdown', 'AI', 'Writing'],
  },
  {
    id: '2',
    title: 'Dev.to Integration',
    description:
      'Direct publishing to Dev.to with automatic formatting and metadata handling.',
    detailedDescription:
      'Connect your Dev.to account and publish content directly from Cross Write. Our integration handles proper frontmatter formatting and ensures your posts look great on Dev.to.',
    date: '2025-01-10',
    type: 'feature',
    link: '/integrations',
    tags: ['Dev.to', 'Publishing', 'Integration'],
  },
  {
    id: '3',
    title: 'Hashnode Integration',
    description:
      'Direct publishing to Hashnode with optimized metadata and content formatting.',
    detailedDescription:
      'Connect your Hashnode account and publish content seamlessly. Our integration ensures proper metadata handling and content formatting for optimal presentation on Hashnode.',
    date: '2025-01-08',
    type: 'feature',
    link: '/integrations',
    tags: ['Hashnode', 'Publishing', 'Integration'],
  },
  {
    id: '4',
    title: 'Draft Management',
    description:
      'Create, edit, and organize your content drafts with a simple interface.',
    detailedDescription:
      'Organize your writing workflow with our draft management system. Create new drafts, edit existing ones, and keep your content organized as you work on your next great piece.',
    date: '2025-01-05',
    type: 'feature',
    link: '/drafts',
    tags: ['Drafts', 'Organization', 'Writing'],
  },
  {
    id: '5',
    title: 'AI Content Generation',
    description:
      'Generate SEO titles, descriptions, and content summaries with AI assistance.',
    detailedDescription:
      'Leverage AI to enhance your content with automatically generated SEO titles, descriptions, and summaries. Our AI features help optimize your content for better discoverability and engagement.',
    date: '2025-01-03',
    type: 'feature',
    link: '/editor',
    tags: ['AI', 'SEO', 'Content Generation'],
  },
  {
    id: '6',
    title: 'User Authentication & Billing',
    description:
      'Secure user accounts with NextAuth integration and Stripe billing for Pro plans.',
    detailedDescription:
      'Secure authentication powered by NextAuth.js with support for multiple providers. Pro users can upgrade their plan through our Stripe integration to unlock advanced features.',
    date: '2025-01-01',
    type: 'feature',
    tags: ['Authentication', 'Billing', 'Security'],
  },
  {
    id: '7',
    title: 'Content Scheduling (Coming Soon)',
    description:
      'Schedule posts across multiple platforms with intelligent timing recommendations.',
    detailedDescription:
      'Our scheduling system will allow you to schedule posts across all your connected platforms with AI-powered timing recommendations. Write once, schedule everywhere, and let our system handle the rest.',
    date: '2025-02-01',
    type: 'announcement',
    link: '/scheduler',
    tags: ['Scheduling', 'Automation', 'Coming Soon'],
  },
  {
    id: '8',
    title: 'Notifications (Coming Soon)',
    description:
      'Comprehensive notification preferences for publishing success and platform updates.',
    detailedDescription:
      'Stay informed about your content performance with customizable notifications. Get alerts for successful publishes, platform updates, and important account information.',
    date: '2025-02-15',
    type: 'announcement',
    tags: ['Notifications', 'User Experience', 'Coming Soon'],
  },
];
