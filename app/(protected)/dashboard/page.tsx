'use client';

import { listDrafts } from '@/app/actions/drafts';
import { EmptyState } from '@/components/ui/EmptyState';
import { NewsUpdates } from '@/components/ui/NewsUpdates';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { QuotaHint } from '@/components/ui/QuotaHint';
import { StatCard } from '@/components/ui/StatCard';
import { useAppStore } from '@/lib/store';
import { DashboardStats, Draft } from '@/lib/types/dashboard';
import { formatDate, getPlatformDisplayName } from '@/lib/utils';
import { Calendar, Edit3, FileText, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { userPlan } = useAppStore();
  const [stats, setStats] = useState<DashboardStats>({
    drafts: 0,
    scheduled: 0,
    published7Days: 0,
    published30Days: 0,
  });
  const [recentDrafts, setRecentDrafts] = useState<Draft[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);

        const draftsResult = await listDrafts({ page: 1, limit: 100 });
        if (draftsResult.success && draftsResult.data) {
          const drafts = (draftsResult.data as { drafts: Draft[] }).drafts;

          const draftStats = {
            drafts: drafts.filter((d: Draft) => d.status === 'draft').length,
            scheduled: drafts.filter((d: Draft) => d.status === 'scheduled')
              .length,
            published7Days: drafts.filter((d: Draft) => {
              if (d.status !== 'published' || !d.publishedAt) return false;
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return new Date(d.publishedAt) >= sevenDaysAgo;
            }).length,
            published30Days: drafts.filter((d: Draft) => {
              if (d.status !== 'published' || !d.publishedAt) return false;
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return new Date(d.publishedAt) >= thirtyDaysAgo;
            }).length,
          };

          setStats(draftStats);

          const recent = drafts
            .filter((d: Draft) => d.status === 'draft')
            .sort(
              (a: Draft, b: Draft) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            )
            .slice(0, 3);
          setRecentDrafts(recent);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-3xl font-bold mb-2'>Dashboard</h1>
              <p className='text-base-content/70'>
                Welcome back! Here&apos;s what&apos;s happening with your
                content.
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <PlanBadge planId={userPlan.planId} />
              <QuotaHint type='articles' />
              <QuotaHint type='thumbnails' />
            </div>
          </div>
        </div>
        <div className='flex items-center justify-center py-12'>
          <div className='loading loading-spinner loading-lg'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Dashboard</h1>
            <p className='text-base-content/70'>
              Welcome back! Here&apos;s what&apos;s happening with your content.
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            <PlanBadge planId={userPlan.planId} />
            <QuotaHint type='articles' />
            <QuotaHint type='thumbnails' />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='Drafts'
          value={stats.drafts}
          icon={<FileText size={20} />}
          description='In progress'
        />
        <StatCard
          title='Scheduled'
          value={stats.scheduled}
          icon={<Calendar size={20} />}
          description='Ready to publish'
        />
        <StatCard
          title='Published (7d)'
          value={stats.published7Days}
          icon={<TrendingUp size={20} />}
          description='Last week'
        />
        <StatCard
          title='Published (30d)'
          value={stats.published30Days}
          icon={<TrendingUp size={20} />}
          description='Last month'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body'>
            <h2 className='card-title text-lg mb-4'>Recent Activity</h2>
            <div className='space-y-4'>
              <div className='text-center py-8'>
                <p className='text-base-content/70'>No recent activity</p>
                <p className='text-sm text-base-content/50 mt-1'>
                  Your publishing activity will appear here
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='card-title text-lg'>Continue Drafting</h2>
              <Link href='/editor' className='btn btn-primary btn-sm'>
                <Plus size={16} className='mr-2' />
                New Draft
              </Link>
            </div>

            {recentDrafts.length === 0 ? (
              <EmptyState
                icon={<Edit3 />}
                title='No drafts yet'
                description='Start writing your first draft to see it here.'
                action={
                  <Link href='/editor' className='btn btn-primary'>
                    Start Writing
                  </Link>
                }
              />
            ) : (
              <div className='space-y-4'>
                {recentDrafts.map(draft => (
                  <Link
                    key={draft.id}
                    href={`/editor?id=${draft.id}`}
                    className='block p-4 border border-base-300 rounded-lg hover:border-primary hover:bg-base-50 transition-all duration-200 group'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 pr-4'>
                        <h3 className='font-semibold text-base mb-2 group-hover:text-primary transition-colors'>
                          {draft.title}
                        </h3>
                        <p className='text-sm text-base-content/60 mb-3 leading-relaxed'>
                          {draft.contentPreview &&
                          draft.contentPreview.length > 80
                            ? `${draft.contentPreview.substring(0, 80)}...`
                            : draft.contentPreview || 'No preview available'}
                        </p>
                        <div className='space-y-2'>
                          <div className='flex items-center space-x-2'>
                            {draft.platforms
                              ?.slice(0, 3)
                              .map((platform: string) => (
                                <span
                                  key={platform}
                                  className='px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md'
                                >
                                  {getPlatformDisplayName(platform)}
                                </span>
                              ))}
                            {draft.platforms && draft.platforms.length > 3 && (
                              <span className='text-xs text-base-content/50'>
                                +{draft.platforms.length - 3} more
                              </span>
                            )}
                          </div>
                          <div className='text-xs text-base-content/50'>
                            {formatDate(new Date(draft.updatedAt))}
                          </div>
                        </div>
                      </div>
                      <div className='flex-shrink-0'>
                        <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200'>
                          <Edit3 size={16} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='lg:col-span-1'>
          <NewsUpdates />
        </div>
      </div>
    </div>
  );
}
