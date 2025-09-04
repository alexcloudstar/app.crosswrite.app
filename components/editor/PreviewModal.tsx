'use client';

import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { X, Smartphone, Tablet, Monitor } from 'lucide-react';

type PreviewModalProps = {
  title: string;
  content: string;
  onClose: () => void;
};

type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function PreviewModal({ title, content, onClose }: PreviewModalProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  const deviceConfig = {
    mobile: { width: '375px', icon: Smartphone },
    tablet: { width: '768px', icon: Tablet },
    desktop: { width: '100%', icon: Monitor },
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
              <div className='prose prose-sm max-w-none'>
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
