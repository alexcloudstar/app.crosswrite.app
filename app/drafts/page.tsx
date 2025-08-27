'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Calendar,
  Plus,
  FileText,
  X,
  Clock,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  formatDate,
  getPlatformDisplayName,
  getPlatformColor,
} from '@/lib/utils';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { publishToPlatforms } from '@/app/actions/integrations/publish';
import { listDrafts } from '@/app/actions/drafts';
import { listIntegrations } from '@/app/actions/integrations';

interface Draft {
  id: string;
  title: string;
  content: string;
  contentPreview?: string;
  status: string;
  platforms: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledAt?: Date;
}

interface ListDraftsResponse {
  drafts: Draft[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDraftId, setScheduleDraftId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'devto',
    'hashnode',
  ]);
  const [publishingDraft, setPublishingDraft] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<
    Array<{
      id: string;
      platform: string;
      status: string;
      publicationId?: string;
    }>
  >([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [draftsResult, integrationsResult] = await Promise.all([
          listDrafts({
            page: 1,
            limit: 100,
          }),
          listIntegrations(),
        ]);

        if (draftsResult.success && draftsResult.data) {
          setDrafts((draftsResult.data as ListDraftsResponse).drafts);
        }

        if (integrationsResult.success && integrationsResult.data) {
          setIntegrations(
            integrationsResult.data as Array<{
              id: string;
              platform: string;
              status: string;
              publicationId?: string;
            }>
          );
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdown &&
        !(event.target as Element).closest('.dropdown-container')
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const filteredDrafts = drafts.filter((draft: Draft) => {
    const matchesSearch =
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (draft.contentPreview &&
        draft.contentPreview.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' || draft.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedDrafts.length === filteredDrafts.length) {
      setSelectedDrafts([]);
      return;
    }

    setSelectedDrafts(filteredDrafts.map((d: Draft) => d.id));
  };

  const handleSelectDraft = (id: string) =>
    setSelectedDrafts(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );

  const handleBulkSchedule = () => {
    setScheduleDraftId(null);
    setShowScheduleModal(true);
  };

  const handleScheduleDraft = (draftId: string) => {
    console.log('clicked');
    setScheduleDraftId(draftId);
    setShowScheduleModal(true);
  };

  const handleDeleteDraft = (draftId: string) => {
    // TODO: Implement delete functionality

    console.log('Delete draft:', draftId);
  };

  const handleBulkDelete = () => {
    // TODO: Implement bulk delete functionality
    console.log('Delete drafts:', selectedDrafts);
    setSelectedDrafts([]);
  };

  const handlePublishDraft = async (draftId: string) => {
    setPublishingDraft(draftId);
    try {
      const result = await publishToPlatforms({
        draftId,
        platforms: selectedPlatforms,
        options: {
          publishAsDraft: false,
        },
      });

      if (result.success) {
        const data = result.data as {
          results: Array<{
            platform: string;
            success: boolean;
            platformPostId?: string;
            platformUrl?: string;
            error?: string;
          }>;
          summary: {
            total: number;
            successful: number;
            failed: number;
            draftId: string;
          };
        };
        console.log('Published successfully:', data);

        if (data.summary) {
          const { successful, total } = data.summary;
          if (successful > 0) {
            alert(
              `Successfully published to ${successful} out of ${total} platforms!`
            );
          } else {
            const errorMessages = data.results
              .filter(r => !r.success)
              .map(r => {
                let message = `${r.platform}: ${r.error}`;
                if (r.error?.includes('Publication ID is required')) {
                  message +=
                    '\n  → Go to Integrations page and click &quot;Select Publication&quot; to set up your publication ID';
                }
                return message;
              })
              .join('\n\n');
            alert(`Failed to publish to any platforms:\n\n${errorMessages}`);
          }
        }

        const reloadResult = await listDrafts({
          page: 1,
          limit: 100,
        });
        if (reloadResult.success && reloadResult.data) {
          setDrafts((reloadResult.data as ListDraftsResponse).drafts);
        }
      } else {
        console.error('Publish failed:', result.error);
        alert(`Publish failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert(
        `Publish error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setPublishingDraft(null);
    }
  };

  const handleScheduleSubmit = () => {
    // TODO: Implement schedule functionality
    console.log('Scheduling:', {
      draftId: scheduleDraftId,
      selectedDrafts: scheduleDraftId ? null : selectedDrafts,
      date: scheduleDate,
      time: scheduleTime,
      platforms: selectedPlatforms,
    });

    setShowScheduleModal(false);
    setScheduleDraftId(null);
    setScheduleDate('');
    setScheduleTime('');
    setSelectedPlatforms(['devto', 'hashnode']);

    if (!scheduleDraftId) {
      setSelectedDrafts([]);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { color: 'badge-warning', text: 'Draft' },
      scheduled: { color: 'badge-info', text: 'Scheduled' },
      published: { color: 'badge-success', text: 'Published' },
    };
    const configItem = config[status as keyof typeof config] || config.draft;
    return (
      <span className={`badge ${configItem.color}`}>{configItem.text}</span>
    );
  };

  const getDraftToSchedule = () => {
    if (scheduleDraftId) {
      return drafts.find((d: Draft) => d.id === scheduleDraftId);
    }
    return null;
  };

  const searchDrafts = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setStatusFilter(e.target.value);

  const toggleModal = () => setShowScheduleModal(prev => !prev);

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const onScheduleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setScheduleDate(e.target.value);

  const onScheduleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setScheduleTime(e.target.value);

  const integrationsNeedingPublicationIds = integrations.filter(
    integration =>
      integration.status === 'connected' &&
      integration.platform === 'hashnode' &&
      !integration.publicationId
  );

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Drafts</h1>
          <p className='text-base-content/70'>
            Manage your content drafts and published posts
          </p>
        </div>
        <Link href='/editor' className='btn btn-primary'>
          <Plus size={16} className='mr-2' />
          New Draft
        </Link>
      </div>

      {integrationsNeedingPublicationIds.length > 0 && (
        <div className='alert alert-warning mb-6'>
          <div>
            <h3 className='font-bold'>Integration Setup Required</h3>
            <div className='text-sm'>
              Some of your integrations need publication IDs to publish content:
              {integrationsNeedingPublicationIds.map(integration => (
                <div key={integration.id} className='mt-1'>
                  •{' '}
                  {integration.platform.charAt(0).toUpperCase() +
                    integration.platform.slice(1)}
                  : Missing publication ID
                </div>
              ))}
              <div className='mt-2'>
                <p>To fix this:</p>
                <ol className='list-decimal list-inside mt-1 space-y-1'>
                  <li>
                    Go to the{' '}
                    <Link href='/integrations' className='link link-primary'>
                      Integrations page
                    </Link>
                  </li>
                  <li>
                    Click &quot;Select Publication&quot; for each platform
                  </li>
                  <li>Choose your publication from the list</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='card bg-base-100 border border-base-300 shadow-sm mb-6'>
        <div className='card-body'>
          <div className='flex flex-col lg:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search
                  size={20}
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50'
                />
                <input
                  type='text'
                  placeholder='Search drafts...'
                  value={searchQuery}
                  onChange={searchDrafts}
                  className='input input-bordered w-full pl-10'
                />
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Filter size={20} className='text-base-content/50' />
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className='select select-bordered'
              >
                <option value='all'>All Status</option>
                <option value='draft'>Draft</option>
                <option value='scheduled'>Scheduled</option>
                <option value='published'>Published</option>
              </select>
            </div>

            {selectedDrafts.length > 0 && (
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-base-content/50'>
                  {selectedDrafts.length} selected
                </span>
                <button
                  onClick={handleBulkSchedule}
                  className='btn btn-outline btn-sm'
                >
                  <Calendar size={16} className='mr-2' />
                  Schedule
                </button>
                <button
                  onClick={() => handlePublishDraft(selectedDrafts[0])}
                  disabled={publishingDraft !== null}
                  className='btn btn-primary btn-sm'
                >
                  <Send size={16} className='mr-2' />
                  {publishingDraft ? 'Publishing...' : 'Publish'}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className='btn btn-error btn-sm'
                >
                  <Trash2 size={16} className='mr-2' />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='loading loading-spinner loading-lg'></div>
          <span className='ml-4'>Loading drafts...</span>
        </div>
      ) : filteredDrafts.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title='No drafts found'
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start writing your first draft to see it here.'
          }
          action={
            <Link href='/editor' className='btn btn-primary'>
              Start Writing
            </Link>
          }
        />
      ) : (
        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='w-full'>
            <table className='table w-full'>
              <thead>
                <tr>
                  <th>
                    <CustomCheckbox
                      size='sm'
                      checked={selectedDrafts.length === filteredDrafts.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Title</th>
                  <th>Platforms</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrafts.map(draft => (
                  <tr key={draft.id} className='hover:bg-base-200'>
                    <td>
                      <CustomCheckbox
                        size='sm'
                        checked={selectedDrafts.includes(draft.id)}
                        onChange={handleSelectDraft.bind(null, draft.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <div className='font-medium'>{draft.title}</div>
                        <div className='text-sm text-base-content/50 truncate max-w-xs'>
                          {draft.contentPreview}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className='flex items-center space-x-1'>
                        {draft.platforms.map(platform => (
                          <span
                            key={platform}
                            className={`w-2 h-2 rounded-full ${getPlatformColor(
                              platform
                            )}`}
                            title={getPlatformDisplayName(platform)}
                          />
                        ))}
                      </div>
                    </td>
                    <td>{getStatusBadge(draft.status)}</td>
                    <td>
                      <div className='text-sm'>
                        {formatDate(draft.updatedAt)}
                      </div>
                    </td>
                    <td>
                      <div className='relative dropdown-container'>
                        <button
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(
                              'Dropdown clicked for draft:',
                              draft.id
                            );
                            setOpenDropdown(
                              openDropdown === draft.id ? null : draft.id
                            );
                          }}
                          className='btn btn-ghost btn-sm btn-circle'
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openDropdown === draft.id && (
                          <div className='absolute right-0 top-full mt-1 bg-base-200 rounded-box shadow-lg z-50 min-w-[200px] border border-base-300'>
                            <ul className='menu p-2 w-full'>
                              <li>
                                <Link href={`/editor?id=${draft.id}`}>
                                  <Edit3 size={16} />
                                  Edit
                                </Link>
                              </li>
                              <li>
                                <button
                                  onClick={() => {
                                    handlePublishDraft(draft.id);
                                    setOpenDropdown(null);
                                  }}
                                  disabled={publishingDraft === draft.id}
                                  className={
                                    publishingDraft === draft.id
                                      ? 'opacity-50'
                                      : ''
                                  }
                                >
                                  <Send size={16} />
                                  {publishingDraft === draft.id
                                    ? 'Publishing...'
                                    : 'Publish'}
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => {
                                    handleScheduleDraft(draft.id);
                                    setOpenDropdown(null);
                                  }}
                                >
                                  <Calendar size={16} />
                                  Schedule
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => {
                                    handleDeleteDraft(draft.id);
                                    setOpenDropdown(null);
                                  }}
                                  className='text-error'
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className='modal modal-open'>
          <div className='modal-box max-w-md'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-bold text-lg flex items-center'>
                <Calendar size={20} className='mr-2' />
                Schedule Post
              </h3>
              <button
                onClick={toggleModal}
                className='btn btn-ghost btn-sm btn-circle'
              >
                <X size={16} />
              </button>
            </div>

            {scheduleDraftId && getDraftToSchedule() && (
              <div className='card bg-base-200 p-4 mb-4'>
                <h4 className='font-medium mb-2'>Draft to Schedule:</h4>
                <p className='text-sm'>{getDraftToSchedule()?.title}</p>
              </div>
            )}

            {!scheduleDraftId && selectedDrafts.length > 0 && (
              <div className='card bg-base-200 p-4 mb-4'>
                <h4 className='font-medium mb-2'>Drafts to Schedule:</h4>
                <p className='text-sm'>
                  {selectedDrafts.length} selected drafts
                </p>
              </div>
            )}

            <div className='space-y-4'>
              <div>
                <label className='label'>
                  <span className='label-text'>Date</span>
                </label>
                <input
                  type='date'
                  value={scheduleDate}
                  onChange={onScheduleDateChange}
                  className='input input-bordered w-full'
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className='label'>
                  <span className='label-text'>Time</span>
                </label>
                <input
                  type='time'
                  value={scheduleTime}
                  onChange={onScheduleTimeChange}
                  className='input input-bordered w-full'
                />
              </div>

              <div>
                <label className='label'>
                  <span className='label-text'>Platforms</span>
                </label>
                <div className='flex flex-wrap gap-3'>
                  {['devto', 'hashnode'].map(platform => (
                    <CustomCheckbox
                      key={platform}
                      size='sm'
                      checked={selectedPlatforms.includes(platform)}
                      onChange={handlePlatformToggle.bind(null, platform)}
                    >
                      <span className='capitalize'>{platform}</span>
                    </CustomCheckbox>
                  ))}
                </div>
              </div>
            </div>

            <div className='modal-action'>
              <button onClick={toggleModal} className='btn btn-ghost'>
                Cancel
              </button>
              <button
                onClick={handleScheduleSubmit}
                className='btn btn-primary'
                disabled={!scheduleDate || !scheduleTime}
              >
                <Clock size={16} className='mr-2' />
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
