'use client';

import { useState } from 'react';
import { X, Smartphone, Tablet, Monitor } from 'lucide-react';

interface PreviewModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function PreviewModal({ title, content, onClose }: PreviewModalProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  const deviceConfig = {
    mobile: { width: '375px', icon: Smartphone },
    tablet: { width: '768px', icon: Tablet },
    desktop: { width: '100%', icon: Monitor },
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-semibold mb-2">$1</h3>'
      )
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-base-200 px-1 rounded">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|li|p|code])(.*$)/gim, '<p class="mb-4">$1</p>');
  };

  return (
    <div className='modal modal-open'>
      <div className='modal-box max-w-4xl p-0'>
        <div className='flex items-center justify-between p-4 border-b border-base-300'>
          <h3 className='font-bold text-lg'>Preview</h3>
          <div className='flex items-center space-x-2'>
            <div className='flex items-center space-x-1 bg-base-200 rounded-lg p-1'>
              {(['mobile', 'tablet', 'desktop'] as DeviceType[]).map(device => {
                const Icon = deviceConfig[device].icon;
                return (
                  <button
                    key={device}
                    onClick={setDeviceType.bind(null, device)}
                    className={`btn btn-sm ${
                      deviceType === device ? 'btn-primary' : 'btn-ghost'
                    }`}
                    title={`${
                      device.charAt(0).toUpperCase() + device.slice(1)
                    } view`}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
            <button
              onClick={onClose}
              className='btn btn-ghost btn-sm btn-circle'
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className='p-6'>
          <div
            className='mx-auto bg-base-100 border border-base-300 rounded-lg overflow-hidden'
            style={{
              maxWidth: deviceConfig[deviceType].width,
              minHeight: deviceType === 'mobile' ? '600px' : '400px',
            }}
          >
            {deviceType === 'mobile' && (
              <div className='bg-base-300 h-8 flex items-center justify-center'>
                <div className='w-16 h-1 bg-base-content/20 rounded-full'></div>
              </div>
            )}

            <div className='p-6'>
              <h1 className='text-2xl font-bold mb-6'>{title}</h1>
              <div
                className='prose prose-sm max-w-none'
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(content),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
