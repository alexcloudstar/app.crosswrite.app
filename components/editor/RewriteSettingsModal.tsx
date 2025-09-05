'use client';

type RewriteSettingsModalProps = {
  isOpen: boolean;
  selectedTone: 'professional' | 'casual' | 'friendly' | 'academic';
  selectedLength: 'keep' | 'shorter' | 'longer';
  onToneChange: (
    tone: 'professional' | 'casual' | 'friendly' | 'academic'
  ) => void;
  onLengthChange: (length: 'keep' | 'shorter' | 'longer') => void;
  onClose: () => void;
  onApply: () => void;
};

export const RewriteSettingsModal = ({
  isOpen,
  selectedTone,
  selectedLength,
  onToneChange,
  onLengthChange,
  onClose,
  onApply,
}: RewriteSettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className='modal modal-open'>
      <div className='modal-box max-w-md'>
        <h3 className='font-bold text-lg mb-4'>AI Rewrite Settings</h3>
        <div className='space-y-4'>
          <div>
            <label className='label'>
              <span className='label-text'>Tone</span>
            </label>
            <select
              className='select select-bordered w-full'
              value={selectedTone}
              onChange={e =>
                onToneChange(
                  e.target.value as
                    | 'professional'
                    | 'casual'
                    | 'friendly'
                    | 'academic'
                )
              }
            >
              <option value='professional'>Professional</option>
              <option value='casual'>Casual</option>
              <option value='friendly'>Friendly</option>
              <option value='academic'>Academic</option>
            </select>
          </div>
          <div>
            <label className='label'>
              <span className='label-text'>Length</span>
            </label>
            <select
              className='select select-bordered w-full'
              value={selectedLength}
              onChange={e =>
                onLengthChange(e.target.value as 'keep' | 'shorter' | 'longer')
              }
            >
              <option value='keep'>Keep current length</option>
              <option value='shorter'>Make it shorter</option>
              <option value='longer'>Make it longer</option>
            </select>
          </div>
        </div>
        <div className='modal-action'>
          <button className='btn btn-ghost' onClick={onClose}>
            Cancel
          </button>
          <button
            className='btn btn-primary'
            onClick={onApply}
            title='Apply settings to content'
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
