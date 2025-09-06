import { Edit3, MoreHorizontal, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Draft } from '@/lib/types/drafts';
import {
  formatDate,
  getPlatformColor,
  getPlatformDisplayName,
} from '@/lib/utils';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';

type DraftRowProps = {
  draft: Draft;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  isPublishing: boolean;
  isDropdownOpen: boolean;
  onToggleDropdown: (id: string) => void;
};

export function DraftRow({
  draft,
  isSelected,
  onSelect,
  onDelete,
  onPublish,
  isPublishing,
  isDropdownOpen,
  onToggleDropdown,
}: DraftRowProps) {
  const getStatusBadge = (status: string) => {
    const config = {
      draft: { color: 'badge-warning', text: 'Draft' },
      published: { color: 'badge-success', text: 'Published' },
    };
    const configItem = config[status as keyof typeof config] || config.draft;
    return (
      <span className={`badge ${configItem.color}`}>{configItem.text}</span>
    );
  };

  const onSelectHandler = () => onSelect(draft.id);
  const onPublishHandler = () => {
    if (draft.status === 'published') {
      return; // Don't publish if already published
    }
    onPublish(draft.id);
  };
  const onDeleteHandler = () => onDelete(draft.id);

  return (
    <tr className='hover:bg-base-200'>
      <td>
        <CustomCheckbox
          size='sm'
          checked={isSelected}
          onChange={() => onSelectHandler()}
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
              className={`w-2 h-2 rounded-full ${getPlatformColor(platform)}`}
              title={getPlatformDisplayName(platform)}
            />
          ))}
        </div>
      </td>
      <td>{getStatusBadge(draft.status)}</td>
      <td>
        <div className='text-sm'>{formatDate(draft.updatedAt)}</div>
      </td>
      <td>
        <div className='relative dropdown-container'>
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onToggleDropdown(draft.id);
            }}
            className='btn btn-ghost btn-sm btn-circle'
          >
            <MoreHorizontal size={16} />
          </button>
          {isDropdownOpen && (
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
                    onClick={onPublishHandler}
                    disabled={isPublishing || draft.status === 'published'}
                    className={
                      isPublishing || draft.status === 'published'
                        ? 'opacity-50'
                        : ''
                    }
                    title={
                      draft.status === 'published'
                        ? 'This draft has already been published'
                        : ''
                    }
                  >
                    <Send size={16} />
                    {isPublishing
                      ? 'Publishing...'
                      : draft.status === 'published'
                        ? 'Published'
                        : 'Publish'}
                  </button>
                </li>
                <li>
                  <button onClick={onDeleteHandler} className='text-error'>
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
  );
}
