'use client';

import Link from 'next/link';
import { Bell, ExternalLink, Calendar, Star } from 'lucide-react';
import { NewsItemSummary } from '@/lib/types/news';

// Import the actual news data from the updates page
const newsItems: NewsItemSummary[] = [
  {
    id: '1',
    title: 'AI-Powered Content Assistant',
    description:
      'Advanced AI integration with real-time writing suggestions, content improvement, and SEO optimization.',
    date: '2025-08-28',
    type: 'feature',
    link: '/editor',
  },
  {
    id: '2',
    title: 'Multi-Platform Publishing',
    description:
      'Publish to Dev.to, Hashnode, and Beehiiv with automatic formatting and optimization.',
    date: '2025-08-25',
    type: 'feature',
    link: '/integrations',
  },
  {
    id: '3',
    title: 'Advanced Content Scheduling',
    description:
      'Schedule posts across multiple platforms with intelligent timing and automatic publishing.',
    date: '2025-08-22',
    type: 'feature',
    link: '/scheduler',
  },
  {
    id: '5',
    title: 'Enhanced Draft Management',
    description:
      'Organize your content with version control, collaboration features, and advanced organization.',
    date: '2025-08-18',
    type: 'feature',
    link: '/drafts',
  },
  {
    id: '6',
    title: 'AI Content Generation',
    description:
      'Generate SEO metadata, content summaries, and thumbnail suggestions with AI.',
    date: '2025-08-15',
    type: 'feature',
    link: '/editor',
  },
  {
    id: '7',
    title: 'Platform-Specific Optimizations',
    description:
      'Automatic content formatting and optimization for each publishing platform.',
    date: '2025-08-12',
    type: 'update',
    link: '/integrations',
  },
  {
    id: '8',
    title: 'Background Job Processing',
    description:
      'Reliable scheduled post processing with retry logic and error handling.',
    date: '2025-08-10',
    type: 'update',
    link: '/scheduler',
  },
  {
    id: '9',
    title: 'Enhanced Security & Performance',
    description:
      'Improved authentication, rate limiting, and overall platform performance.',
    date: '2025-08-08',
    type: 'update',
  },
];

function getTypeIcon(type: NewsItemSummary['type']) {
  switch (type) {
    case 'feature':
      return <Star className='w-4 h-4 text-primary' />;
    case 'update':
      return <Bell className='w-4 h-4 text-info' />;
    case 'announcement':
      return <Calendar className='w-4 h-4 text-warning' />;
    default:
      return <Bell className='w-4 h-4' />;
  }
}

function getTypeLabel(type: NewsItemSummary['type']) {
  switch (type) {
    case 'feature':
      return 'New Feature';
    case 'update':
      return 'Update';
    case 'announcement':
      return 'Announcement';
    default:
      return 'News';
  }
}

export function NewsUpdates() {
  return (
    <div className='card bg-base-100 border border-base-300 shadow-sm p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-bold text-lg'>Latest Updates</h3>
        <div className='flex items-center space-x-1 text-sm text-base-content/60'>
          <Bell className='w-4 h-4' />
          <span>News</span>
        </div>
      </div>

      <div className='space-y-2'>
        {newsItems.slice(0, 3).map(item => (
          <div
            key={item.id}
            className='p-2 border border-base-300 rounded-lg hover:border-primary/50 hover:bg-base-50 transition-all duration-200'
          >
            <div className='flex items-start space-x-2'>
              <div className='flex-shrink-0 mt-0.5'>
                {getTypeIcon(item.type)}
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <span className='text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium'>
                        {getTypeLabel(item.type)}
                      </span>
                      <span className='text-xs text-base-content/50'>
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className='font-semibold text-sm mb-1 line-clamp-1'>
                      {item.title}
                    </h4>

                    <p className='text-xs text-base-content/70 line-clamp-2'>
                      {item.description}
                    </p>
                  </div>

                  {item.link && (
                    <a
                      href={item.link}
                      className='flex-shrink-0 ml-2 p-1 text-base-content/50 hover:text-primary transition-colors'
                      title='Learn more'
                    >
                      <ExternalLink className='w-3 h-3' />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-4 pt-3 border-t border-base-300'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-base-content/60'>
            Stay updated with the latest features
          </span>
          <Link
            href='/updates'
            className='text-primary hover:text-primary/80 transition-colors font-medium'
          >
            View All Updates
          </Link>
        </div>
      </div>
    </div>
  );
}
