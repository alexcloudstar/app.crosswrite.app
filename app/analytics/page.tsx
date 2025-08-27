'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Eye, Clock, Globe, Download, Plus } from 'lucide-react';
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
import { formatDate, getPlatformDisplayName } from '@/lib/utils';
import {
  getOverview,
  getReadsOverTime,
  getPlatformBreakdown,
  getTopPosts,
  getPublishSuccessRate,
} from '@/app/actions/analytics';
import {
  AnalyticsOverview,
  ReadsOverTimeData,
  PlatformBreakdownData,
  TopPostData,
  PublishSuccessData,
  AnalyticsResponse,
} from '@/lib/types/analytics';

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

        // Load overview data
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

        // Load reads over time
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

        // Load platform breakdown
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

        // Load top posts
        const postsResult = await getTopPosts({ range });
        if (postsResult.success && postsResult.data) {
          const posts = (postsResult.data as AnalyticsResponse<TopPostData[]>)
            .data;
          setAnalyticsData(prev => ({
            ...prev,
            topPosts: posts || [],
          }));
        }

        // Load publish success rate
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
            Start publishing content to see your analytics here. Your
            performance metrics, read counts, and engagement data will appear
            once you have published posts.
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
