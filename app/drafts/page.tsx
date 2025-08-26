'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { mockDrafts } from '@/lib/mock';
import {
  formatDate,
  getPlatformDisplayName,
  getPlatformColor,
} from '@/lib/utils';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';

export default function DraftsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDraftId, setScheduleDraftId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'twitter',
    'linkedin',
    'medium',
    'dev',
  ]);

  const filteredDrafts = mockDrafts.filter(draft => {
    const matchesSearch =
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.contentPreview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || draft.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedDrafts.length === filteredDrafts.length) {
      setSelectedDrafts([]);
      return;
    }

    setSelectedDrafts(filteredDrafts.map(d => d.id));
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
    setSelectedPlatforms(['twitter', 'linkedin', 'medium', 'dev']);

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
      return mockDrafts.find(d => d.id === scheduleDraftId);
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

      {filteredDrafts.length === 0 ? (
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
          <div className='overflow-x-auto'>
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
                      <div className='dropdown dropdown-end'>
                        <button className='btn btn-ghost btn-sm btn-circle'>
                          <MoreHorizontal size={16} />
                        </button>
                        <ul className='dropdown-content menu bg-base-200 rounded-box w-52 shadow-lg'>
                          <li>
                            <Link href={`/editor?id=${draft.id}`}>
                              <Edit3 size={16} />
                              Edit
                            </Link>
                          </li>
                          <li>
                            <button
                              onClick={handleScheduleDraft.bind(null, draft.id)}
                            >
                              <Calendar size={16} />
                              Schedule
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={handleDeleteDraft.bind(null, draft.id)}
                              className='text-error'
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </li>
                        </ul>
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
                  {['twitter', 'linkedin', 'medium', 'dev'].map(platform => (
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
