'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { formatDateTime, getPlatformDisplayName } from '@/lib/utils';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { supportedPlatforms } from '@/lib/config/platforms';
import { listDrafts } from '@/app/actions/drafts';
import { EmptyState } from '@/components/ui/EmptyState';
import { Draft } from '@/lib/types/drafts';

export default function SchedulerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSchedulingForm, setShowSchedulingForm] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDrafts() {
      try {
        setLoading(true);
        const result = await listDrafts({ page: 1, limit: 100 });
        if (result.success && result.data) {
          const draftsData = (result.data as { drafts: Draft[] }).drafts;
          setDrafts(draftsData);
        }
      } catch {
        toast.error('Failed to load drafts');
      } finally {
        setLoading(false);
      }
    }

    loadDrafts();
  }, []);

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const scheduledDrafts = drafts.filter(draft => draft.status === 'scheduled');

  const draftDrafts = drafts.filter(draft => draft.status === 'draft');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  const getScheduledPostsForDate = (date: Date) => {
    const posts = scheduledDrafts.filter(
      draft =>
        draft.scheduledAt &&
        draft.scheduledAt.toDateString() === date.toDateString()
    );

    return posts;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();

  const isSelected = (date: Date) =>
    selectedDate && date.toDateString() === selectedDate.toDateString();

  const toggleShowSchedulingForm = () => setShowSchedulingForm(prev => !prev);

  if (loading) {
    return (
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Scheduler</h1>
            <p className='text-base-content/70'>
              Schedule your content for optimal publishing times
            </p>
          </div>
        </div>
        <div className='flex items-center justify-center py-12'>
          <div className='loading loading-spinner loading-lg'></div>
          <span className='ml-4'>Loading scheduler...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Scheduler</h1>
          <p className='text-base-content/70'>
            Schedule your content for optimal publishing times
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <button
            onClick={toggleShowSchedulingForm}
            className='btn btn-primary'
          >
            <Plus size={16} className='mr-2' />
            Schedule Post
          </button>
        </div>
      </div>

      {drafts.length === 0 ? (
        <EmptyState
          icon={<Clock />}
          title='No drafts available'
          description='Create some drafts first to schedule them for publishing.'
          action={
            <button
              onClick={toggleShowSchedulingForm}
              className='btn btn-primary'
            >
              <Plus size={16} className='mr-2' />
              Create Draft
            </button>
          }
        />
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            <div className='card bg-base-100 border border-base-300 shadow-sm'>
              <div className='card-body'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-xl font-semibold'>
                    {currentDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h2>
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={navigateMonth.bind(null, 'prev')}
                      className='btn btn-ghost btn-sm btn-circle'
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={setCurrentDate.bind(null, new Date())}
                      className='btn btn-outline btn-sm'
                    >
                      Today
                    </button>
                    <button
                      onClick={navigateMonth.bind(null, 'next')}
                      className='btn btn-ghost btn-sm btn-circle'
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className='grid grid-cols-7 gap-1'>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    day => (
                      <div
                        key={day}
                        className='p-2 text-center text-sm font-medium text-base-content/50'
                      >
                        {day}
                      </div>
                    )
                  )}

                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className='p-2' />;
                    }

                    const scheduledPosts = getScheduledPostsForDate(day);

                    return (
                      <div
                        key={day.toISOString()}
                        onClick={setSelectedDate.bind(null, day)}
                        className={`
                        p-2 min-h-[80px] border border-base-300 cursor-pointer hover:bg-base-200 transition-colors
                        ${isToday(day) ? 'bg-primary/10 border-primary' : ''}
                        ${isSelected(day) ? 'bg-base-200 border-primary' : ''}
                      `}
                      >
                        <div className='text-sm font-medium mb-1'>
                          {day.getDate()}
                        </div>

                        <div className='space-y-1'>
                          {scheduledPosts.slice(0, 2).map(draft => (
                            <div
                              key={draft.id}
                              className='text-xs p-1 bg-primary/20 rounded truncate'
                              title={draft.title}
                            >
                              {draft.title}
                            </div>
                          ))}
                          {scheduledPosts.length > 2 && (
                            <div className='text-xs text-base-content/50'>
                              +{scheduledPosts.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            {selectedDate && (
              <div className='card bg-base-100 border border-base-300 shadow-sm'>
                <div className='card-body'>
                  <h3 className='font-semibold mb-4'>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>

                  {getScheduledPostsForDate(selectedDate).length === 0 ? (
                    <p className='text-sm text-base-content/50'>
                      No posts scheduled
                    </p>
                  ) : (
                    <div className='space-y-3'>
                      {getScheduledPostsForDate(selectedDate).map(draft => (
                        <div
                          key={draft.id}
                          className='p-3 bg-base-200 rounded-lg'
                        >
                          <h4 className='font-medium text-sm mb-1'>
                            {draft.title}
                          </h4>
                          <div className='flex items-center justify-between text-xs text-base-content/50'>
                            <span>{formatDateTime(draft.scheduledAt!)}</span>
                            <div className='flex items-center space-x-1'>
                              {draft.platforms.map(platform => (
                                <span
                                  key={platform}
                                  className='px-2 py-1 bg-base-300 rounded text-xs'
                                >
                                  {getPlatformDisplayName(platform)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showSchedulingForm && (
        <div className='modal modal-open'>
          <div className='modal-box max-w-md'>
            <h3 className='font-bold text-lg mb-4'>Schedule Post</h3>
            <div className='space-y-4'>
              <div>
                <label className='label'>
                  <span className='label-text'>Select Draft</span>
                </label>
                <select className='select select-bordered w-full'>
                  <option>Choose a draft...</option>
                  {draftDrafts.map(draft => (
                    <option key={draft.id} value={draft.id}>
                      {draft.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='label'>
                  <span className='label-text'>Date & Time</span>
                </label>
                <input
                  type='datetime-local'
                  className='input input-bordered w-full'
                />
              </div>

              <div>
                <label className='label'>
                  <span className='label-text'>Platforms</span>
                </label>
                <div className='space-y-2'>
                  {supportedPlatforms.map(platform => (
                    <CustomCheckbox
                      key={platform}
                      size='sm'
                      checked={selectedPlatforms.includes(platform)}
                      onChange={handlePlatformToggle.bind(null, platform)}
                    >
                      {getPlatformDisplayName(platform)}
                    </CustomCheckbox>
                  ))}
                </div>
              </div>

              <div>
                <label className='label'>
                  <span className='label-text'>Timezone</span>
                </label>
                <select className='select select-bordered w-full'>
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                </select>
              </div>
            </div>
            <div className='modal-action'>
              <button
                className='btn btn-ghost'
                onClick={toggleShowSchedulingForm}
              >
                Cancel
              </button>
              <button
                className='btn btn-primary'
                onClick={toggleShowSchedulingForm}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
