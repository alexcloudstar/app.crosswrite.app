import { Check } from 'lucide-react';

type Publication = {
  id: string;
  name: string;
  description?: string;
  domain?: string;
};

type PublicationSelectorProps = {
  isOpen: boolean;
  publications: Publication[];
  selectedPublicationId: string;
  onClose: () => void;
  onSelectPublication: (publication: Publication) => void;
};

export function PublicationSelector({
  isOpen,
  publications,
  selectedPublicationId,
  onClose,
  onSelectPublication,
}: PublicationSelectorProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className='modal modal-open'>
      <div className='modal-box max-w-2xl'>
        <h3 className='font-bold text-lg mb-4'>Select Publication</h3>
        <div className='space-y-4'>
          {publications.map(publication => (
            <div
              key={publication.id}
              className={`card p-4 cursor-pointer transition-colors duration-200 border-2 relative ${
                selectedPublicationId === publication.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-base-200 border-transparent hover:border-primary hover:bg-base-300'
              }`}
              onClick={() => {
                onSelectPublication(publication);
                onClose();
              }}
            >
              {selectedPublicationId === publication.id && (
                <div className='absolute top-2 right-2'>
                  <Check className='w-5 h-5 text-primary' />
                </div>
              )}
              <h4 className='font-semibold'>{publication.name}</h4>
              {publication.description && (
                <p className='text-sm text-base-content/70 mt-1'>
                  {publication.description}
                </p>
              )}
              {publication.domain && (
                <p className='text-xs text-base-content/50 mt-1'>
                  {publication.domain}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className='modal-action'>
          <button className='btn btn-ghost' onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
