'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import {
  DraftsHeader,
  IntegrationWarning,
  DraftsFilters,
  DraftsTable,
  DeleteModal,
} from '@/components/drafts';
import { useDrafts } from '@/hooks/use-drafts';
import { Draft } from '@/lib/types/drafts';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DraftsPage() {
  const {
    drafts,
    loading,
    integrations,
    publishingDraft,
    handleDeleteDraft,
    handleBulkDelete,
    handlePublishDraft,
  } = useDrafts();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'bulk';
    draftId?: string;
    count?: number;
  } | null>(null);

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

  const handleDeleteDraftClick = (draftId: string) => {
    setDeleteTarget({ type: 'single', draftId });
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'single' && deleteTarget.draftId) {
        await handleDeleteDraft(deleteTarget.draftId);
        setSelectedDrafts(prev =>
          prev.filter(id => id !== deleteTarget.draftId)
        );
      } else if (deleteTarget.type === 'bulk' && deleteTarget.count) {
        await handleBulkDelete(selectedDrafts);
        setSelectedDrafts([]);
      }
    } catch {
      // Error handling is done in the hook
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedDrafts.length === 0) {
      return;
    }
    setDeleteTarget({ type: 'bulk', count: selectedDrafts.length });
    setShowDeleteModal(true);
  };

  const handlePublishSelected = () => {
    if (selectedDrafts.length > 0) {
      handlePublishDraft(selectedDrafts[0]);
    }
  };

  const onCloseDeleteModalHandler = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <DraftsHeader />

      <IntegrationWarning integrations={integrations} />

      <DraftsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedDrafts={selectedDrafts}
        onPublishSelected={handlePublishSelected}
        onBulkDelete={handleBulkDeleteClick}
        isPublishing={publishingDraft !== null}
      />

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
        <DraftsTable
          drafts={filteredDrafts}
          selectedDrafts={selectedDrafts}
          onSelectAll={handleSelectAll}
          onSelectDraft={handleSelectDraft}
          onDeleteDraft={handleDeleteDraftClick}
          onPublishDraft={handlePublishDraft}
          publishingDraft={publishingDraft}
          openDropdown={openDropdown}
          onToggleDropdown={setOpenDropdown}
        />
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        deleteTarget={deleteTarget}
        onClose={onCloseDeleteModalHandler}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
