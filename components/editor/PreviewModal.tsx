'use client';

import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { X, Smartphone, Tablet, Monitor, Eye } from 'lucide-react';

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
      <div className='modal-box max-w-6xl w-full p-0 bg-base-100 shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-base-300 bg-base-200/50'>
          <div className='flex items-center gap-3'>
            <Eye className='w-5 h-5 text-primary' />
            <h3 className='font-bold text-xl text-base-content'>
              Article Preview
            </h3>
          </div>
          <div className='flex items-center gap-3'>
            {/* Device Selector */}
            <div className='flex items-center gap-1 bg-base-100 rounded-lg p-1 shadow-sm border border-base-300'>
              {(['mobile', 'tablet', 'desktop'] as DeviceType[]).map(device => {
                const Icon = deviceConfig[device].icon;
                return (
                  <button
                    key={device}
                    onClick={() => setDeviceType(device)}
                    className={`btn btn-sm transition-all duration-200 ${
                      deviceType === device
                        ? 'btn-primary shadow-sm'
                        : 'btn-ghost hover:bg-base-200'
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
              className='btn btn-ghost btn-sm btn-circle hover:bg-base-300'
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className='p-8 bg-base-100'>
          <div
            className='mx-auto bg-base-100 shadow-lg border border-base-300 rounded-xl overflow-hidden transition-all duration-300'
            style={{
              maxWidth: deviceConfig[deviceType].width,
              minHeight: deviceType === 'mobile' ? '600px' : '500px',
            }}
          >
            {/* Mobile Status Bar */}
            {deviceType === 'mobile' && (
              <div className='bg-gray-800 h-8 flex items-center justify-between px-4'>
                <div className='flex items-center gap-2'>
                  <div className='w-1 h-1 bg-white rounded-full'></div>
                  <div className='w-1 h-1 bg-white rounded-full'></div>
                  <div className='w-1 h-1 bg-white rounded-full'></div>
                </div>
                <div className='text-white text-xs font-medium'>9:41</div>
                <div className='flex items-center gap-1'>
                  <div className='w-4 h-2 border border-white rounded-sm'>
                    <div className='w-3 h-1.5 bg-white rounded-sm m-0.5'></div>
                  </div>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className='p-8 md:p-12'>
              <article className='max-w-none'>
                <header className='mb-8'>
                  <h1 className='text-3xl md:text-4xl font-bold text-base-content leading-tight mb-4'>
                    {title}
                  </h1>
                  <div className='flex items-center gap-4 text-sm text-base-content/70'>
                    <span>Published on {new Date().toLocaleDateString()}</span>
                    <span>•</span>
                    <span>5 min read</span>
                  </div>
                </header>

                <div className='prose prose-lg max-w-none prose-headings:text-base-content prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base-content prose-p:leading-relaxed prose-p:mb-4 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-base-content prose-strong:font-semibold prose-code:text-sm prose-code:bg-base-200 prose-code:text-base-content prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-pre:bg-base-300 prose-pre:text-base-content prose-pre:border prose-pre:border-base-300 prose-pre:rounded-lg prose-pre:p-4 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-base-200/50 prose-blockquote:py-2 prose-ul:list-disc prose-ol:list-decimal prose-li:text-base-content prose-li:mb-1 prose-hr:border-base-300 prose-table:text-sm prose-th:bg-base-200 prose-th:text-base-content prose-td:border-base-300 prose-td:text-base-content'>
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
