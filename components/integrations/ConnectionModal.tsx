import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { platformConfig } from '@/lib/config/platforms';

type ConnectionModalProps = {
  isOpen: boolean;
  platform: string | null;
  apiKey: string;
  publicationId: string;
  setAsCanonical: boolean;
  publishAsDraft: boolean;
  connecting: string | null;
  onClose: () => void;
  onApiKeyChange: (value: string) => void;
  onPublicationIdChange: (value: string) => void;
  onSetAsCanonicalChange: (value: boolean) => void;
  onPublishAsDraftChange: (value: boolean) => void;
  onSave: (platform: string) => void;
};

export function ConnectionModal({
  isOpen,
  platform,
  apiKey,
  publicationId,
  setAsCanonical,
  publishAsDraft,
  connecting,
  onClose,
  onApiKeyChange,
  onPublicationIdChange,
  onSetAsCanonicalChange,
  onPublishAsDraftChange,
  onSave,
}: ConnectionModalProps) {
  if (!isOpen || !platform) {
    return null;
  }

  const platformName =
    platformConfig[platform as keyof typeof platformConfig]?.name;

  const onApiKeyChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
    onApiKeyChange(e.target.value);
  const onPublicationIdChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => onPublicationIdChange(e.target.value);
  const onSetAsCanonicalChangeHandler = (value: boolean) =>
    onSetAsCanonicalChange(value);
  const onPublishAsDraftChangeHandler = (value: boolean) =>
    onPublishAsDraftChange(value);
  const onSaveHandler = () => onSave(platform);

  return (
    <div className='modal modal-open'>
      <div className='modal-box max-w-2xl'>
        <h3 className='font-bold text-lg mb-4'>Connect to {platformName}</h3>

        <div className='space-y-6'>
          {platform === 'devto' && (
            <div className='space-y-4'>
              <div className='alert alert-info'>
                <div>
                  <h4 className='font-semibold'>Dev.to API Key</h4>
                  <p className='text-sm mt-2'>
                    Get your API key from{' '}
                    <a
                      href='https://dev.to/settings/account'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='link link-primary'
                    >
                      dev.to/settings/account
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <label className='label'>
                  <span className='label-text'>API Key</span>
                </label>
                <input
                  type='password'
                  placeholder='Enter your Dev.to API key'
                  value={apiKey}
                  onChange={onApiKeyChangeHandler}
                  className='input input-bordered w-full'
                />
                <label className='label'>
                  <span className='label-text-alt'>
                    Your API key will be stored securely
                  </span>
                </label>
              </div>
            </div>
          )}

          {platform === 'hashnode' && (
            <div className='space-y-4'>
              <div className='alert alert-info'>
                <div>
                  <h4 className='font-semibold'>Hashnode GraphQL Token</h4>
                  <p className='text-sm mt-2'>
                    Get your GraphQL token from{' '}
                    <a
                      href='https://hashnode.com/settings/developer'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='link link-primary'
                    >
                      hashnode.com/settings/developer
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <label className='label'>
                  <span className='label-text'>GraphQL Token</span>
                </label>
                <input
                  type='password'
                  placeholder='Enter your Hashnode GraphQL token'
                  value={apiKey}
                  onChange={onApiKeyChangeHandler}
                  className='input input-bordered w-full'
                />
              </div>

              <div>
                <label className='label'>
                  <span className='label-text'>Publication ID (Optional)</span>
                </label>
                <input
                  type='text'
                  placeholder='Enter your publication ID if you have multiple publications'
                  value={publicationId}
                  onChange={onPublicationIdChangeHandler}
                  className='input input-bordered w-full'
                />
                <label className='label'>
                  <span className='label-text-alt'>
                    Leave empty to use your default publication
                  </span>
                </label>
              </div>
            </div>
          )}

          <div>
            <h4 className='font-semibold mb-3'>Publishing Defaults</h4>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <CustomCheckbox
                  checked={setAsCanonical}
                  onChange={onSetAsCanonicalChangeHandler}
                >
                  Set as canonical URL
                </CustomCheckbox>
              </div>

              <div className='flex items-center space-x-2'>
                <CustomCheckbox
                  checked={publishAsDraft}
                  onChange={onPublishAsDraftChangeHandler}
                >
                  Publish as unlisted/draft
                </CustomCheckbox>
              </div>
            </div>
          </div>
        </div>

        <div className='modal-action'>
          <button
            className='btn btn-ghost'
            onClick={onClose}
            disabled={connecting === platform}
          >
            Cancel
          </button>
          <button
            className='btn btn-primary'
            onClick={onSaveHandler}
            disabled={connecting === platform || !apiKey.trim()}
          >
            {connecting === platform ? (
              <>
                <div className='loading loading-spinner loading-xs'></div>
                Connecting...
              </>
            ) : (
              'Connect Platform'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
