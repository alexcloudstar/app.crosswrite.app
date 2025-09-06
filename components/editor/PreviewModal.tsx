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

                <div className='markdown-content'>
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className='text-3xl md:text-4xl font-bold text-base-content mb-6 mt-8 first:mt-0'>
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className='text-2xl md:text-3xl font-bold text-base-content mb-4 mt-6'>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className='text-xl md:text-2xl font-bold text-base-content mb-3 mt-5'>
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className='text-lg md:text-xl font-bold text-base-content mb-2 mt-4'>
                          {children}
                        </h4>
                      ),
                      h5: ({ children }) => (
                        <h5 className='text-base md:text-lg font-bold text-base-content mb-2 mt-3'>
                          {children}
                        </h5>
                      ),
                      h6: ({ children }) => (
                        <h6 className='text-sm md:text-base font-bold text-base-content mb-2 mt-3'>
                          {children}
                        </h6>
                      ),
                      p: ({ children }) => (
                        <p className='text-base-content leading-relaxed mb-4'>
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className='font-semibold text-base-content'>
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className='italic text-base-content'>{children}</em>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className='text-primary hover:underline no-underline'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {children}
                        </a>
                      ),
                      code: ({ children }) => (
                        <code className='text-sm bg-base-200 text-base-content px-2 py-1 rounded font-mono'>
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className='bg-base-300 text-base-content border border-base-300 rounded-lg p-4 overflow-x-auto mb-4'>
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className='border-l-4 border-primary pl-4 italic bg-base-200/50 py-2 mb-4'>
                          {children}
                        </blockquote>
                      ),
                      ul: ({ children }) => (
                        <ul className='list-disc list-inside mb-4 text-base-content'>
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className='list-decimal list-inside mb-4 text-base-content'>
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className='mb-1 text-base-content'>{children}</li>
                      ),
                      hr: () => <hr className='border-base-300 my-6' />,
                      table: ({ children }) => (
                        <div className='overflow-x-auto mb-4'>
                          <table className='table table-zebra w-full text-sm'>
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className='bg-base-200'>{children}</thead>
                      ),
                      tbody: ({ children }) => <tbody>{children}</tbody>,
                      tr: ({ children }) => <tr>{children}</tr>,
                      th: ({ children }) => (
                        <th className='bg-base-200 text-base-content font-semibold px-4 py-2 text-left'>
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className='border-base-300 text-base-content px-4 py-2'>
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
