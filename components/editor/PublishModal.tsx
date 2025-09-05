'use client';

import { Send, X } from 'lucide-react';
import Link from 'next/link';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { supportedPlatforms } from '@/lib/config/platforms';

type PublishModalProps = {
  isOpen: boolean;
  selectedPlatforms: string[];
  connectedPlatforms: string[];
  publishing: boolean;
  onClose: () => void;
  onPlatformToggle: (platform: string) => void;
  onPublish: () => void;
};

export const PublishModal = ({
  isOpen,
  selectedPlatforms,
  connectedPlatforms,
  publishing,
  onClose,
  onPlatformToggle,
  onPublish,
}: PublishModalProps) => {
  if (!isOpen) return null;

  return (
    <div className='modal modal-open'>
      <div className='modal-box max-w-md'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-bold text-lg flex items-center'>
            <Send size={20} className='mr-2' />
            Publish to Platforms
          </h3>
          <button onClick={onClose} className='btn btn-ghost btn-sm btn-circle'>
            <X size={16} />
          </button>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='label'>
              <span className='label-text'>Select Platforms</span>
            </label>
            <div className='space-y-2'>
              {supportedPlatforms.map(platform => {
                const isConnected = connectedPlatforms.includes(platform);
                return (
                  <CustomCheckbox
                    key={platform}
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => onPlatformToggle(platform)}
                    disabled={!isConnected}
                  >
                    <span
                      className={`capitalize ${
                        !isConnected ? 'opacity-50' : ''
                      }`}
                    >
                      {platform}
                      {!isConnected && ' (Not Connected)'}
                    </span>
                  </CustomCheckbox>
                );
              })}
            </div>
          </div>

          <div className='text-sm text-base-content/70'>
            <p>Your article will be published to the selected platforms.</p>
            <p className='mt-1'>
              Make sure you have connected these platforms in the{' '}
              <Link href='/integrations' className='link link-primary'>
                Integrations page
              </Link>{' '}
              first.
            </p>
            {selectedPlatforms.length === 0 && (
              <div className='alert alert-warning mt-4'>
                <div>
                  <span className='font-medium'>No platforms selected!</span>
                  <p className='text-xs mt-1'>
                    Please select at least one platform to publish to.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='modal-action'>
          <button
            onClick={onClose}
            className='btn btn-ghost'
            disabled={publishing}
          >
            Cancel
          </button>
          <button
            onClick={onPublish}
            className='btn btn-primary'
            disabled={publishing || selectedPlatforms.length === 0}
          >
            <Send size={16} className='mr-2' />
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};
