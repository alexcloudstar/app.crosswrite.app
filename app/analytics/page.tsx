'use client';

import {
  getOverview,
  getPlatformBreakdown,
  getPublishSuccessRate,
  getReadsOverTime,
  getTopPosts,
} from '@/app/actions/analytics';
import NoData from '@/components/analytics/NoData';
import { StatCard } from '@/components/ui/StatCard';
import {
  AnalyticsOverview,
  AnalyticsResponse,
  PlatformBreakdownData,
  PublishSuccessData,
  ReadsOverTimeData,
  TopPostData,
} from '@/lib/types/analytics';
import { formatDate, getPlatformDisplayName } from '@/lib/utils';
import { Clock, Download, Eye, Globe, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#f4978e', '#7ad3a3', '#89b4fa', '#ffd166'];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{
    overview: AnalyticsOverview;
    readsOverTime: ReadsOverTimeData[];
    readsByPlatform: PlatformBreakdownData[];
    publishSuccess: PublishSuccessData[];
    topPosts: TopPostData[];
  }>({
    overview: {
      reads: 0,
      clicks: 0,
      reactions: 0,
      shares: 0,
      ctr: 0,
      avgReadTime: 0,
      platformsReached: 0,
    },
    readsOverTime: [],
    readsByPlatform: [],
    publishSuccess: [],
    topPosts: [],
  });

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' },
  ];

  const onDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setDateRange(e.target.value);

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        setIsLoading(true);
        const range = `${dateRange}d` as '7d' | '30d' | '90d';

        const overviewResult = await getOverview({ range });
        if (overviewResult.success && overviewResult.data) {
          const overview = overviewResult.data as AnalyticsOverview;
          setAnalyticsData(prev => ({
            ...prev,
            overview: {
              reads: overview.reads || 0,
              clicks: overview.clicks || 0,
              reactions: overview.reactions || 0,
              shares: overview.shares || 0,
              ctr: overview.ctr || 0,
              avgReadTime: overview.avgReadTime || 0,
              platformsReached: overview.platformsReached || 0,
            },
          }));
        }

        const readsResult = await getReadsOverTime({ range });
        if (readsResult.success && readsResult.data) {
          const readsData = (
            readsResult.data as AnalyticsResponse<ReadsOverTimeData[]>
          ).data;
          setAnalyticsData(prev => ({
            ...prev,
            readsOverTime: readsData || [],
          }));
        }

        const platformResult = await getPlatformBreakdown({ range });
        if (platformResult.success && platformResult.data) {
          const platforms = (
            platformResult.data as AnalyticsResponse<PlatformBreakdownData[]>
          ).data;
          setAnalyticsData(prev => ({
            ...prev,
            readsByPlatform: platforms || [],
          }));
        }

        const postsResult = await getTopPosts({ range });
        if (postsResult.success && postsResult.data) {
          const posts = (postsResult.data as AnalyticsResponse<TopPostData[]>)
            .data;
          setAnalyticsData(prev => ({
            ...prev,
            topPosts: posts || [],
          }));
        }

        const successResult = await getPublishSuccessRate({ range });
        if (successResult.success && successResult.data) {
          const successData = successResult.data as AnalyticsResponse<{
            breakdown: PublishSuccessData[];
          }>;
          setAnalyticsData(prev => ({
            ...prev,
            publishSuccess: successData?.data?.breakdown || [],
          }));
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalyticsData();
  }, [dateRange]);

  const hasData =
    analyticsData.overview.reads > 0 || analyticsData.topPosts.length > 0;

  if (isLoading) {
    return (
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Analytics</h1>
            <p className='text-base-content/70'>
              Track your content performance across all platforms
            </p>
          </div>
        </div>
        <div className='flex items-center justify-center py-12'>
          <div className='loading loading-spinner loading-lg'></div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <NoData
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        dateRangeOptions={dateRangeOptions}
      />
    );
  }

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
          value={analyticsData.overview.reads.toLocaleString()}
          icon={<Eye size={20} />}
        />
        <StatCard
          title='Click Rate'
          value={`${analyticsData.overview.ctr}%`}
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          title='Avg Read Time'
          value={`${analyticsData.overview.avgReadTime}m`}
          icon={<Clock size={20} />}
        />
        <StatCard
          title='Platforms Reached'
          value={analyticsData.overview.platformsReached}
          icon={<Globe size={20} />}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body'>
            <h3 className='card-title text-lg mb-4'>Reads Over Time</h3>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={analyticsData.readsOverTime}>
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
                <BarChart data={analyticsData.readsByPlatform}>
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
                    data={analyticsData.publishSuccess}
                    cx='50%'
                    cy='50%'
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey='count'
                  >
                    {analyticsData.publishSuccess.map((_, index) => (
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
              {analyticsData.publishSuccess.map(
                (item: PublishSuccessData, index: number) => (
                  <div
                    key={item.status}
                    className='flex items-center space-x-2'
                  >
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className='text-sm'>{item.status}</span>
                  </div>
                )
              )}
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
                  {analyticsData.topPosts.map((post: TopPostData) => (
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
                        {formatDate(new Date(post.publishDate))}
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
