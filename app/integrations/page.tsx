'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, ExternalLink, Settings } from 'lucide-react';
import { mockIntegrations } from '@/lib/mock';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [showSettings, setShowSettings] = useState<string | null>(null);

  const [connecting, setConnecting] = useState<string | null>(null);

  const [setAsCanonical, setSetAsCanonical] = useState(false);
  const [publishAsDraft, setPublishAsDraft] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [importExisting, setImportExisting] = useState(false);

  const platformConfig: Record<
    string,
    {
      name: string;
      description: string;
      color: string;
      icon: string;
      url: string;
    }
  > = {
    medium: {
      name: 'Medium',
      description: 'Publish to Medium with automatic formatting',
      color: 'bg-green-500',
      icon: 'M',
      url: 'https://medium.com',
    },
    dev: {
      name: 'Dev.to',
      description: 'Connect your dev.to account to publish articles directly',
      color: 'bg-purple-500',
      icon: 'DEV',
      url: 'https://dev.to',
    },
    hashnode: {
      name: 'Hashnode',
      description: "Share your content on Hashnode's developer community",
      color: 'bg-purple-600',
      icon: 'H',
      url: 'https://hashnode.com',
    },
    beehiiv: {
      name: 'Beehiiv',
      description: 'Publish newsletters and grow your audience',
      color: 'bg-orange-500',
      icon: 'B',
      url: 'https://beehiiv.com',
    },
  };

  const handleConnect = async (platform: string) => {
    setShowSettings(platform);
  };

  const handleDisconnect = async (platform: string) => {
    setConnecting(platform);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIntegrations(prev =>
        prev.map(integration =>
          integration.platform === platform
            ? {
                ...integration,
                status: 'disconnected' as const,
                connectedAt: undefined,
                lastSync: undefined,
              }
            : integration
        )
      );

      console.log('Successfully disconnected from', platform);
    } catch (error) {
      console.error('Failed to disconnect from', platform, error);
    } finally {
      setConnecting(null);
    }
  };

  const handleSaveSettings = async (platform: string) => {
    setConnecting(platform);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIntegrations(prev =>
        prev.map(integration =>
          integration.platform === platform
            ? {
                ...integration,
                status: 'connected' as const,
                connectedAt: new Date(),
                lastSync: new Date(),
              }
            : integration
        )
      );

      setShowSettings(null);
      console.log('Successfully connected to', platform);
    } catch (error) {
      console.error('Failed to connect to', platform, error);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Integrations</h1>
        <p className='text-base-content/70'>
          Connect your publishing platforms to automate your content
          distribution
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {integrations.map(integration => {
          const config = platformConfig[integration.platform];

          if (!config) {
            console.warn(
              `No config found for platform: ${integration.platform}`
            );
            return null;
          }

          return (
            <div
              key={integration.platform}
              className='card bg-base-100 border border-base-300 shadow-sm'
            >
              <div className='card-body'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center text-white font-bold`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <h3 className='font-semibold'>{config.name}</h3>
                      <p className='text-sm text-base-content/50'>
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {integration.status === 'connected' ? (
                      <div className='flex items-center space-x-1 text-success'>
                        <CheckCircle size={16} />
                        <span className='text-sm'>Connected</span>
                      </div>
                    ) : (
                      <div className='flex items-center space-x-1 text-base-content/50'>
                        <XCircle size={16} />
                        <span className='text-sm'>Not Connected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <a
                      href={config.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='btn btn-ghost btn-sm'
                    >
                      <ExternalLink size={16} className='mr-1' />
                      Visit
                    </a>
                    {integration.status === 'connected' && (
                      <button
                        onClick={setShowSettings.bind(
                          null,
                          integration.platform
                        )}
                        className='btn btn-ghost btn-sm'
                      >
                        <Settings size={16} className='mr-1' />
                        Settings
                      </button>
                    )}
                  </div>

                  <div className='flex items-center space-x-2'>
                    {integration.status === 'connected' ? (
                      <button
                        onClick={handleDisconnect.bind(
                          null,
                          integration.platform
                        )}
                        disabled={connecting === integration.platform}
                        className='btn btn-outline btn-sm'
                      >
                        {connecting === integration.platform ? (
                          <>
                            <div className='loading loading-spinner loading-xs'></div>
                            Disconnecting...
                          </>
                        ) : (
                          'Disconnect'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleConnect.bind(null, integration.platform)}
                        disabled={connecting === integration.platform}
                        className='btn btn-primary btn-sm'
                      >
                        {connecting === integration.platform ? (
                          <>
                            <div className='loading loading-spinner loading-xs'></div>
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {integration.status === 'connected' && integration.lastSync && (
                  <div className='mt-3 pt-3 border-t border-base-300'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-base-content/50'>Last synced</span>
                      <span>{integration.lastSync.toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showSettings && (
        <div className='modal modal-open'>
          <div className='modal-box max-w-2xl'>
            <h3 className='font-bold text-lg mb-4'>
              {
                platformConfig[showSettings as keyof typeof platformConfig]
                  ?.name
              }{' '}
              Settings
            </h3>

            <div className='space-y-6'>
              <div>
                <h4 className='font-semibold mb-3'>API Configuration</h4>
                <div className='space-y-4'>
                  <div>
                    <label className='label'>
                      <span className='label-text'>API Configuration</span>
                    </label>
                    <div className='alert alert-info'>
                      <span>
                        API keys are managed securely by Cross Write. No
                        additional configuration required.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='font-semibold mb-3'>Publishing Defaults</h4>
                <div className='space-y-4'>
                  <div>
                    <label className='label'>
                      <span className='label-text'>Default Tags</span>
                    </label>
                    <input
                      type='text'
                      placeholder='Enter tags separated by commas'
                      className='input input-bordered w-full'
                    />
                  </div>

                  <div className='flex items-center space-x-2'>
                    <CustomCheckbox
                      checked={setAsCanonical}
                      onChange={setSetAsCanonical}
                    >
                      Set as canonical URL
                    </CustomCheckbox>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <CustomCheckbox
                      checked={publishAsDraft}
                      onChange={setPublishAsDraft}
                    >
                      Publish as unlisted/draft
                    </CustomCheckbox>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='font-semibold mb-3'>Sync Options</h4>
                <div className='space-y-2'>
                  <CustomCheckbox checked={autoSync} onChange={setAutoSync}>
                    Auto-sync published posts
                  </CustomCheckbox>
                  <CustomCheckbox
                    checked={importExisting}
                    onChange={setImportExisting}
                  >
                    Import existing posts
                  </CustomCheckbox>
                </div>
              </div>
            </div>

            <div className='modal-action'>
              <button
                className='btn btn-ghost'
                onClick={setShowSettings.bind(null, null)}
                disabled={connecting === showSettings}
              >
                Cancel
              </button>
              <button
                className='btn btn-primary'
                onClick={handleSaveSettings.bind(null, showSettings as string)}
                disabled={connecting === showSettings || !showSettings}
              >
                {connecting === showSettings ? (
                  <>
                    <div className='loading loading-spinner loading-xs'></div>
                    Connecting...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
