'use client';

import { useState } from 'react';
import { TrendingUp, Eye, Clock, Globe, Download } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard } from '@/components/ui/StatCard';
import { mockAnalytics } from '@/lib/mock';
import { formatDate, getPlatformDisplayName } from '@/lib/utils';

const COLORS = ['#f4978e', '#7ad3a3', '#89b4fa', '#ffd166'];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30');

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' },
  ];

  const onDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setDateRange(e.target.value);

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
          <button className='btn btn-outline btn-sm' disabled>
            <Download size={16} className='mr-2' />
            Export CSV
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='Total Reads'
          value={mockAnalytics.totalReads.toLocaleString()}
          icon={<Eye size={20} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title='Click Rate'
          value={`${mockAnalytics.ctr}%`}
          icon={<TrendingUp size={20} />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title='Avg Read Time'
          value={`${mockAnalytics.avgReadTime}m`}
          icon={<Clock size={20} />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title='Platforms Reached'
          value={mockAnalytics.platformsReached}
          icon={<Globe size={20} />}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body'>
            <h3 className='card-title text-lg mb-4'>Reads Over Time</h3>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={mockAnalytics.readsOverTime}>
                  <defs>
                    <linearGradient
                      id='readsGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#f4978e' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#f4978e' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                  <XAxis dataKey='date' stroke='#9ca3af' fontSize={12} />
                  <YAxis stroke='#9ca3af' fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type='monotone'
                    dataKey='reads'
                    stroke='#f4978e'
                    strokeWidth={2}
                    fill='url(#readsGradient)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body'>
            <h3 className='card-title text-lg mb-4'>Reads by Platform</h3>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={mockAnalytics.readsByPlatform}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                  <XAxis dataKey='platform' stroke='#9ca3af' fontSize={12} />
                  <YAxis stroke='#9ca3af' fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey='reads' fill='#f4978e' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body'>
            <h3 className='card-title text-lg mb-4'>Publish Success Rate</h3>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={mockAnalytics.publishSuccess}
                    cx='50%'
                    cy='50%'
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey='count'
                  >
                    {mockAnalytics.publishSuccess.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className='flex justify-center space-x-4 mt-4'>
              {mockAnalytics.publishSuccess.map((item, index) => (
                <div key={item.status} className='flex items-center space-x-2'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className='text-sm'>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body'>
            <h3 className='card-title text-lg mb-4'>Top Performing Posts</h3>
            <div className='overflow-x-auto'>
              <table className='table w-full'>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Platform</th>
                    <th>Reads</th>
                    <th>Reactions</th>
                    <th>Clicks</th>
                    <th>Published</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAnalytics.topPosts.map(post => (
                    <tr key={post.id} className='hover:bg-base-200'>
                      <td>
                        <div className='font-medium text-sm max-w-xs truncate'>
                          {post.title}
                        </div>
                      </td>
                      <td>
                        <span className='badge badge-outline badge-sm'>
                          {getPlatformDisplayName(post.platform)}
                        </span>
                      </td>
                      <td>{post.reads.toLocaleString()}</td>
                      <td>{post.reactions}</td>
                      <td>{post.clicks}</td>
                      <td className='text-sm text-base-content/50'>
                        {formatDate(post.publishDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
