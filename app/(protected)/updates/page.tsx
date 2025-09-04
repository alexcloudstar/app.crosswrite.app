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
import { CENTRALIZED_UPDATES, type NewsItem } from '@/lib/types/news';

const allNewsItems = CENTRALIZED_UPDATES;

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
            Follow our updates page for the latest features and improvements
          </p>
          <div className='text-sm text-base-content/60'>
            <p>Email notifications coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
