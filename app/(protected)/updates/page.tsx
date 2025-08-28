'use client';

import { useState } from 'react';
import {
  Bell,
  ExternalLink,
  Calendar,
  Star,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { NewsItem } from '@/lib/types/news';

const allNewsItems: NewsItem[] = [
  {
    id: '1',
    title: 'AI-Powered Content Assistant',
    description:
      'Advanced AI integration with real-time writing suggestions, content improvement, and SEO optimization.',
    detailedDescription:
      'Our AI assistant is now fully integrated with OpenAI, providing real-time writing suggestions, grammar improvements, content optimization, and SEO recommendations. The system analyzes your content as you write and offers contextual suggestions to enhance readability and engagement.',
    date: '2025-08-28',
    type: 'feature',
    link: '/editor',
    tags: ['AI', 'Writing', 'Productivity'],
  },
  {
    id: '2',
    title: 'Multi-Platform Publishing',
    description:
      'Publish to Dev.to, Hashnode, and Beehiiv with automatic formatting and optimization.',
    detailedDescription:
      "We've launched comprehensive platform integrations for Dev.to, Hashnode, and Beehiiv. Write once and publish everywhere with automatic platform-specific formatting, metadata handling, and content optimization. Each platform gets perfectly formatted content tailored to their requirements.",
    date: '2025-08-25',
    type: 'feature',
    link: '/integrations',
    tags: ['Publishing', 'Platforms', 'Automation'],
  },
  {
    id: '3',
    title: 'Advanced Content Scheduling',
    description:
      'Schedule posts across multiple platforms with intelligent timing and automatic publishing.',
    detailedDescription:
      'Our scheduling system now supports cross-platform publishing with intelligent timing recommendations. Schedule posts days, weeks, or months in advance, and our system will automatically publish them at optimal times across all your connected platforms.',
    date: '2025-08-22',
    type: 'feature',
    link: '/scheduler',
    tags: ['Scheduling', 'Automation', 'Multi-platform'],
  },

  {
    id: '5',
    title: 'Enhanced Draft Management',
    description:
      'Organize your content with version control, collaboration features, and advanced organization.',
    detailedDescription:
      'Our draft management system now includes version control, collaboration tools, and advanced organization features. Track changes, collaborate with team members, and maintain a clean content workflow with folders, tags, and status management.',
    date: '2025-08-18',
    type: 'feature',
    link: '/drafts',
    tags: ['Drafts', 'Organization', 'Collaboration'],
  },
  {
    id: '6',
    title: 'AI Content Generation',
    description:
      'Generate SEO metadata, content summaries, and thumbnail suggestions with AI.',
    detailedDescription:
      'Our AI can now generate SEO titles and descriptions, create content summaries, suggest thumbnails, and even translate content to other languages. All AI features are rate-limited and usage-tracked for optimal performance.',
    date: '2025-08-15',
    type: 'feature',
    link: '/editor',
    tags: ['AI', 'SEO', 'Generation'],
  },
  {
    id: '7',
    title: 'Platform-Specific Optimizations',
    description:
      'Automatic content formatting and optimization for each publishing platform.',
    detailedDescription:
      'Each platform now receives perfectly formatted content with platform-specific optimizations. Dev.to gets proper frontmatter, Hashnode gets optimized metadata, and Beehiiv gets HTML-converted content with proper styling.',
    date: '2025-08-12',
    type: 'update',
    link: '/integrations',
    tags: ['Platforms', 'Optimization', 'Formatting'],
  },
  {
    id: '8',
    title: 'Background Job Processing',
    description:
      'Reliable scheduled post processing with retry logic and error handling.',
    detailedDescription:
      'Our background job processing system ensures your scheduled posts are published reliably. The system includes retry logic for failed publishes, comprehensive error handling, and job monitoring for maximum reliability.',
    date: '2025-08-10',
    type: 'update',
    link: '/scheduler',
    tags: ['Scheduling', 'Reliability', 'Background Jobs'],
  },
  {
    id: '9',
    title: 'Enhanced Security & Performance',
    description:
      'Improved authentication, rate limiting, and overall platform performance.',
    detailedDescription:
      "We've enhanced our security measures with improved authentication, rate limiting, and data protection. Performance has been optimized with database indexing, caching layers, and efficient query patterns for faster response times.",
    date: '2025-08-08',
    type: 'update',
    tags: ['Security', 'Performance', 'Optimization'],
  },
];

function getTypeIcon(type: NewsItem['type']) {
  switch (type) {
    case 'feature':
      return <Star className='w-5 h-5 text-primary' />;
    case 'update':
      return <Bell className='w-5 h-5 text-info' />;
    case 'announcement':
      return <Calendar className='w-5 h-5 text-warning' />;
    default:
      return <Bell className='w-5 h-5' />;
  }
}

function getTypeLabel(type: NewsItem['type']) {
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

function getTypeColor(type: NewsItem['type']) {
  switch (type) {
    case 'feature':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'update':
      return 'bg-info/10 text-info border-info/20';
    case 'announcement':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-base-200 text-base-content border-base-300';
  }
}

export default function UpdatesPage() {
  const [selectedFilter, setSelectedFilter] = useState<
    NewsItem['type'] | 'all'
  >('all');

  const filteredItems =
    selectedFilter === 'all'
      ? allNewsItems
      : allNewsItems.filter(item => item.type === selectedFilter);

  return (
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center space-x-4'>
          <Link href='/' className='btn btn-ghost btn-sm'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Dashboard
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Updates & News</h1>
            <p className='text-base-content/60 mt-1'>
              Stay up to date with the latest features and improvements
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2 text-sm text-base-content/60'>
          <Bell className='w-4 h-4' />
          <span>All Updates</span>
        </div>
      </div>

      <div className='card bg-base-100 border border-base-300 shadow-sm mb-8'>
        <div className='card-body'>
          <div className='flex items-center space-x-4'>
            <Filter className='w-4 h-4 text-base-content/50' />
            <span className='font-medium'>Filter by:</span>
            <div className='flex space-x-2'>
              <button
                onClick={setSelectedFilter.bind(null, 'all')}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-opacity ${
                  selectedFilter === 'all'
                    ? 'bg-primary text-primary-content border-primary'
                    : 'bg-base-200 text-base-content border-base-300 hover:opacity-80'
                }`}
              >
                All
              </button>
              {(['feature', 'update', 'announcement'] as const).map(type => (
                <button
                  key={type}
                  onClick={setSelectedFilter.bind(null, type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-opacity ${
                    selectedFilter === type
                      ? 'bg-primary text-primary-content border-primary'
                      : `${getTypeColor(type)} hover:opacity-80`
                  }`}
                >
                  {getTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {filteredItems.map(item => (
          <div
            key={item.id}
            className='card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='card-body'>
              <div className='flex items-start space-x-3 mb-4'>
                <div className='flex-shrink-0 mt-1'>
                  {getTypeIcon(item.type)}
                </div>

                <div className='flex-1'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                        item.type
                      )}`}
                    >
                      {getTypeLabel(item.type)}
                    </span>
                    <span className='text-xs text-base-content/50'>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className='font-bold text-lg mb-2'>{item.title}</h3>

                  <p className='text-base-content/70 mb-4 leading-relaxed'>
                    {item.detailedDescription || item.description}
                  </p>

                  {item.tags && (
                    <div className='flex flex-wrap gap-2 mb-4'>
                      {item.tags.map(tag => (
                        <span
                          key={tag}
                          className='px-2 py-1 bg-base-200 text-base-content/70 text-xs rounded-md'
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className='flex items-center justify-end'>
                    {item.link && (
                      <Link href={item.link} className='btn btn-primary btn-sm'>
                        Learn More
                        <ExternalLink className='w-3 h-3 ml-1' />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 shadow-sm mt-8'>
        <div className='card-body text-center'>
          <h3 className='text-xl font-bold mb-2'>Stay Updated</h3>
          <p className='text-base-content/70 mb-4'>
            Get notified about new features and updates directly in your inbox
          </p>
          <form
            className='flex max-w-md mx-auto space-x-2'
            onSubmit={e => e.preventDefault()}
          >
            <input
              type='email'
              placeholder='Enter your email'
              className='input input-bordered flex-1'
              required
              pattern='[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
            />
            <button type='submit' className='btn btn-primary'>
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
