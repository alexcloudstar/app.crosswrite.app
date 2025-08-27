'use client';

import { TrendingUp, Plus, Eye, Globe, Clock } from 'lucide-react';
import React from 'react';

type NoDataProps = {
  dateRange: string;
  onDateRangeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  dateRangeOptions: { value: string; label: string }[];
};

const NoData = ({
  dateRange,
  onDateRangeChange,
  dateRangeOptions,
}: NoDataProps) => {
  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Analytics</h1>
          <p className='text-base-content/70'>
            Track your content performance across all platforms
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <select
            value={dateRange}
            onChange={onDateRangeChange}
            className='select select-bordered select-sm'
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mb-6'>
          <TrendingUp size={48} className='text-base-content/50' />
        </div>
        <h2 className='text-2xl font-semibold mb-4'>No Analytics Data Yet</h2>
        <p className='text-base-content/70 max-w-md mb-8'>
          Start publishing content to see your analytics here. Your performance
          metrics, read counts, and engagement data will appear once you have
          published posts.
        </p>
        <div className='flex flex-col sm:flex-row gap-4'>
          <a href='/editor' className='btn btn-primary'>
            <Plus size={16} className='mr-2' />
            Create Your First Post
          </a>
          <a href='/drafts' className='btn btn-outline'>
            View Drafts
          </a>
        </div>
        <div className='mt-8 p-6 bg-base-200 rounded-lg max-w-2xl'>
          <h3 className='font-semibold mb-3'>What you&apos;ll see here:</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-base-content/70'>
            <div className='flex items-center space-x-2'>
              <Eye size={16} />
              <span>Total reads and engagement</span>
            </div>
            <div className='flex items-center space-x-2'>
              <TrendingUp size={16} />
              <span>Performance trends over time</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Globe size={16} />
              <span>Platform-specific analytics</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Clock size={16} />
              <span>Publish success rates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoData;
