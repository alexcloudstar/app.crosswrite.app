import { Filter, Search, Send, Trash2 } from 'lucide-react';

type DraftsFiltersProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  selectedDrafts: string[];
  onPublishSelected: () => void;
  onBulkDelete: () => void;
  isPublishing: boolean;
};

export function DraftsFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  selectedDrafts,
  onPublishSelected,
  onBulkDelete,
  isPublishing,
}: DraftsFiltersProps) {
  const onSearchChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
    onSearchChange(e.target.value);
  const onStatusFilterChangeHandler = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => onStatusFilterChange(e.target.value);

  const onPublishSelectedHandler = () => onPublishSelected();
  const onBulkDeleteHandler = () => onBulkDelete();

  return (
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
                onChange={onSearchChangeHandler}
                className='input input-bordered w-full pl-10'
              />
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Filter size={20} className='text-base-content/50' />
            <select
              value={statusFilter}
              onChange={onStatusFilterChangeHandler}
              className='select select-bordered'
            >
              <option value='all'>All Status</option>
              <option value='draft'>Draft</option>
              <option value='published'>Published</option>
            </select>
          </div>

          {selectedDrafts.length > 0 && (
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-base-content/50'>
                {selectedDrafts.length} selected
              </span>
              <button
                onClick={onPublishSelectedHandler}
                disabled={isPublishing}
                className='btn btn-primary btn-sm'
              >
                <Send size={16} className='mr-2' />
                {isPublishing ? 'Publishing...' : 'Publish'}
              </button>
              <button
                onClick={onBulkDeleteHandler}
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
  );
}
