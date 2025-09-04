interface DeleteTarget {
  type: 'single' | 'bulk';
  draftId?: string;
  count?: number;
}

interface DeleteModalProps {
  isOpen: boolean;
  deleteTarget: DeleteTarget | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({
  isOpen,
  deleteTarget,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  if (!isOpen || !deleteTarget) {
    return null;
  }

  return (
    <div className='modal modal-open'>
      <div className='modal-box max-w-md'>
        <div className='flex items-start space-x-3'>
          <div className='w-8 h-8 rounded-full bg-error/20 text-error flex items-center justify-center flex-shrink-0'>
            ⚠️
          </div>
          <div className='flex-1'>
            <h3 className='font-bold text-lg mb-2'>Confirm Deletion</h3>
            <p className='text-base-content/70'>
              {deleteTarget.type === 'single'
                ? 'Are you sure you want to delete this draft? This action cannot be undone.'
                : `Are you sure you want to delete ${deleteTarget.count} draft(s)? This action cannot be undone.`}
            </p>
          </div>
        </div>

        <div className='modal-action'>
          <button onClick={onClose} className='btn btn-ghost'>
            Cancel
          </button>
          <button onClick={onConfirm} className='btn btn-error'>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
