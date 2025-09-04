import { Draft } from '@/lib/types/drafts';
import { DraftRow } from './DraftRow';

type DraftsTableProps = {
  drafts: Draft[];
  selectedDrafts: string[];
  onSelectAll: () => void;
  onSelectDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  onPublishDraft: (id: string) => void;
  publishingDraft: string | null;
  openDropdown: string | null;
  onToggleDropdown: (id: string) => void;
};

export function DraftsTable({
  drafts,
  selectedDrafts,
  onSelectAll,
  onSelectDraft,
  onDeleteDraft,
  onPublishDraft,
  publishingDraft,
  openDropdown,
  onToggleDropdown,
}: DraftsTableProps) {
  return (
    <div className='card bg-base-100 border border-base-300 shadow-sm'>
      <div className='w-full'>
        <table className='table w-full'>
          <thead>
            <tr>
              <th>
                <input
                  type='checkbox'
                  className='checkbox checkbox-sm'
                  checked={selectedDrafts.length === drafts.length}
                  onChange={onSelectAll}
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
            {drafts.map(draft => (
              <DraftRow
                key={draft.id}
                draft={draft}
                isSelected={selectedDrafts.includes(draft.id)}
                onSelect={onSelectDraft}
                onDelete={onDeleteDraft}
                onPublish={onPublishDraft}
                isPublishing={publishingDraft === draft.id}
                isDropdownOpen={openDropdown === draft.id}
                onToggleDropdown={onToggleDropdown}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
