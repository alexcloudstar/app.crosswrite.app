'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  Settings,
  RefreshCw,
  Check,
} from 'lucide-react';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import {
  listIntegrations,
  connectIntegration,
  disconnectIntegration,
  testIntegration,
  getPlatformPublications,
  syncPlatformAnalytics,
} from '@/app/actions/integrations';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<
    Array<{
      id: string;
      platform: string;
      status: string;
      connectedAt?: Date;
      lastSync?: Date;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [setAsCanonical, setSetAsCanonical] = useState(false);
  const [publishAsDraft, setPublishAsDraft] = useState(false);

  // Connection form states
  const [apiKey, setApiKey] = useState('');
  const [publicationId, setPublicationId] = useState('');
  const [publications, setPublications] = useState<
    Array<{
      id: string;
      name: string;
      description?: string;
      domain?: string;
    }>
  >([]);
  const [showPublicationSelector, setShowPublicationSelector] = useState(false);
  const [selectedPublicationName, setSelectedPublicationName] =
    useState<string>('');

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
    devto: {
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

  // Load integrations on component mount
  useEffect(() => {
    async function loadIntegrations() {
      try {
        const result = await listIntegrations();
        if (result.success && result.data) {
          setIntegrations(
            result.data as Array<{
              id: string;
              platform: string;
              status: string;
              connectedAt?: Date;
              lastSync?: Date;
            }>
          );
        }
      } catch (error) {
        console.error('Failed to load integrations:', error);
      } finally {
        setLoading(false);
      }
    }

    loadIntegrations();
  }, []);

  // Create a list of all available platforms with their connection status
  const getPlatformsWithStatus = () => {
    const connectedPlatforms = new Map(
      integrations.map(integration => [integration.platform, integration])
    );

    return Object.entries(platformConfig).map(([platformKey, config]) => {
      const existingIntegration = connectedPlatforms.get(platformKey);

      return {
        platform: platformKey,
        name: config.name,
        description: config.description,
        color: config.color,
        icon: config.icon,
        url: config.url,
        status: existingIntegration?.status || 'disconnected',
        id: existingIntegration?.id,
        connectedAt: existingIntegration?.connectedAt,
        lastSync: existingIntegration?.lastSync,
      };
    });
  };

  const handleConnect = async (platform: string) => {
    setShowSettings(platform);
  };

  const handleDisconnect = async (platform: string) => {
    const integration = integrations.find(i => i.platform === platform);
    if (!integration) return;

    setConnecting(platform);

    try {
      const result = await disconnectIntegration({ id: integration.id });

      if (result.success) {
        // Reload integrations to get the updated list
        const reloadResult = await listIntegrations();
        if (reloadResult.success && reloadResult.data) {
          setIntegrations(
            reloadResult.data as Array<{
              id: string;
              platform: string;
              status: string;
              connectedAt?: Date;
              lastSync?: Date;
            }>
          );
        }
        console.log('Successfully disconnected from', platform);
      } else {
        alert(`Failed to disconnect: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to disconnect from', platform, error);
      alert('Failed to disconnect. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  const handleTestConnection = async (platform: string) => {
    const integration = integrations.find(i => i.platform === platform);
    if (!integration) return;

    setTesting(platform);

    try {
      const result = await testIntegration({ id: integration.id });

      if (result.success) {
        alert(`Connection test successful for ${platform}`);
        // Reload integrations to get updated lastSync
        const reloadResult = await listIntegrations();
        if (reloadResult.success && reloadResult.data) {
          setIntegrations(
            reloadResult.data as Array<{
              id: string;
              platform: string;
              status: string;
              connectedAt?: Date;
              lastSync?: Date;
            }>
          );
        }
      } else {
        alert(`Connection test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to test connection for', platform, error);
      alert('Failed to test connection. Please try again.');
    } finally {
      setTesting(null);
    }
  };

  const handleSyncAnalytics = async (platform: string) => {
    const integration = integrations.find(i => i.platform === platform);
    if (!integration) return;

    setSyncing(platform);

    try {
      const result = await syncPlatformAnalytics({
        platform: platform as 'medium' | 'devto' | 'hashnode' | 'beehiiv',
        integrationId: integration.id,
      });

      if (result.success) {
        alert(`Analytics sync completed for ${platform}`);
        // Reload integrations to get updated lastSync
        const reloadResult = await listIntegrations();
        if (reloadResult.success && reloadResult.data) {
          setIntegrations(
            reloadResult.data as Array<{
              id: string;
              platform: string;
              status: string;
              connectedAt?: Date;
              lastSync?: Date;
            }>
          );
        }
      } else {
        alert(`Analytics sync failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to sync analytics for', platform, error);
      alert('Failed to sync analytics. Please try again.');
    } finally {
      setSyncing(null);
    }
  };

  const handleLoadPublications = async (platform: string) => {
    const integration = integrations.find(i => i.platform === platform);
    if (!integration) return;

    try {
      const result = await getPlatformPublications({
        platform: platform as 'medium' | 'hashnode' | 'beehiiv',
        integrationId: integration.id,
      });

      if (
        result.success &&
        result.data &&
        typeof result.data === 'object' &&
        'publications' in result.data
      ) {
        setPublications(
          (
            result.data as {
              publications: Array<{
                id: string;
                name: string;
                description?: string;
                domain?: string;
              }>;
            }
          ).publications
        );
        setShowPublicationSelector(true);
      } else {
        alert(`Failed to load publications: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to load publications for', platform, error);
      alert('Failed to load publications. Please try again.');
    }
  };

  const handleSaveSettings = async (platform: string) => {
    setConnecting(platform);

    try {
      // Validate required fields
      if (!apiKey.trim()) {
        alert('API key is required');
        return;
      }

      // Prepare integration data based on platform
      let integrationData: {
        platform: string;
        apiKey: string;
        publicationId?: string;
      } = {
        platform,
        apiKey: '',
      };

      // Add platform-specific fields
      switch (platform) {
        case 'devto':
          integrationData = {
            ...integrationData,
            apiKey: apiKey.trim(),
          };
          break;

        case 'hashnode':
          integrationData = {
            ...integrationData,
            apiKey: apiKey.trim(),
            publicationId: publicationId.trim() || undefined,
          };
          break;

        case 'beehiiv':
          integrationData = {
            ...integrationData,
            apiKey: apiKey.trim(),
            publicationId: publicationId.trim() || undefined,
          };
          break;
      }

      // Call the server action to create the integration
      const result = await connectIntegration(integrationData);

      if (result.success) {
        // Reload integrations to get the updated list
        const reloadResult = await listIntegrations();
        if (reloadResult.success && reloadResult.data) {
          setIntegrations(
            reloadResult.data as Array<{
              id: string;
              platform: string;
              status: string;
              connectedAt?: Date;
              lastSync?: Date;
            }>
          );
        }

        // Clear form data
        setApiKey('');
        setPublicationId('');
        setSelectedPublicationName('');
        setShowSettings(null);

        console.log('Successfully connected to', platform, {
          apiKey: apiKey ? '***' : 'none',
          publicationId: publicationId || 'none',
        });
      } else {
        // Show error message
        alert(`Failed to connect: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to connect to', platform, error);
      alert('Failed to connect. Please try again.');
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

      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='loading loading-spinner loading-lg'></div>
          <span className='ml-4 text-base-content/70'>
            Loading integrations...
          </span>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {getPlatformsWithStatus().map(platform => {
            return (
              <div
                key={platform.platform}
                className='card bg-base-100 border border-base-300 shadow-sm'
              >
                <div className='card-body'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold`}
                      >
                        {platform.icon}
                      </div>
                      <div>
                        <h3 className='font-semibold'>{platform.name}</h3>
                        <p className='text-sm text-base-content/50'>
                          {platform.description}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-1 text-success'>
                      {platform.status === 'connected' ? (
                        <>
                          <CheckCircle size={16} />
                          <span className='text-sm'>Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          <span className='text-sm'>Not Connected</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <a
                        href={platform.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='btn btn-ghost btn-sm'
                      >
                        <ExternalLink size={16} className='mr-1' />
                        Visit
                      </a>
                      {platform.status === 'connected' && (
                        <>
                          <button
                            onClick={setShowSettings.bind(
                              null,
                              platform.platform
                            )}
                            className='btn btn-ghost btn-sm'
                          >
                            <Settings size={16} className='mr-1' />
                            Settings
                          </button>
                          <button
                            onClick={handleTestConnection.bind(
                              null,
                              platform.platform
                            )}
                            disabled={testing === platform.platform}
                            className='btn btn-ghost btn-sm'
                            title='Test Connection'
                          >
                            {testing === platform.platform ? (
                              <div className='loading loading-spinner loading-xs'></div>
                            ) : (
                              <RefreshCw size={16} />
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    <div className='flex items-center space-x-2'>
                      {platform.status === 'connected' ? (
                        <button
                          onClick={handleDisconnect.bind(
                            null,
                            platform.platform
                          )}
                          disabled={connecting === platform.platform}
                          className='btn btn-outline btn-sm'
                        >
                          {connecting === platform.platform ? (
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
                          onClick={handleConnect.bind(null, platform.platform)}
                          disabled={connecting === platform.platform}
                          className='btn btn-primary btn-sm'
                        >
                          {connecting === platform.platform ? (
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

                  {platform.status === 'connected' && platform.lastSync && (
                    <div className='mt-3 pt-3 border-t border-base-300'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-base-content/50'>
                          Last synced
                        </span>
                        <span>{platform.lastSync.toLocaleDateString()}</span>
                      </div>
                      <div className='flex items-center space-x-2 mt-2'>
                        <button
                          onClick={handleSyncAnalytics.bind(
                            null,
                            platform.platform
                          )}
                          disabled={syncing === platform.platform}
                          className='btn btn-ghost btn-xs'
                        >
                          {syncing === platform.platform ? (
                            <>
                              <div className='loading loading-spinner loading-xs'></div>
                              Syncing...
                            </>
                          ) : (
                            'Sync Analytics'
                          )}
                        </button>
                        {(platform.platform === 'hashnode' ||
                          platform.platform === 'beehiiv') && (
                          <div className='flex items-center space-x-2'>
                            {selectedPublicationName && (
                              <span className='text-xs text-base-content/70'>
                                Selected: {selectedPublicationName}
                              </span>
                            )}
                            <button
                              onClick={handleLoadPublications.bind(
                                null,
                                platform.platform
                              )}
                              className={`btn btn-xs ${
                                selectedPublicationName
                                  ? 'btn-success'
                                  : 'btn-ghost'
                              }`}
                            >
                              {selectedPublicationName
                                ? 'Change Publication'
                                : 'Select Publication'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publication Selector Modal */}
      {showPublicationSelector && (
        <div className='modal modal-open'>
          <div className='modal-box max-w-2xl'>
            <h3 className='font-bold text-lg mb-4'>Select Publication</h3>
            <div className='space-y-4'>
              {publications.map(publication => (
                <div
                  key={publication.id}
                  className={`card p-4 cursor-pointer transition-colors duration-200 border-2 relative ${
                    publicationId === publication.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-base-200 border-transparent hover:border-primary hover:bg-base-300'
                  }`}
                  onClick={() => {
                    setPublicationId(publication.id);
                    setSelectedPublicationName(publication.name);
                    setShowPublicationSelector(false);
                    // Show a brief success message
                    const successMessage = document.createElement('div');
                    successMessage.className =
                      'alert alert-success fixed top-4 right-4 z-50 max-w-sm';
                    successMessage.innerHTML = `
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Publication "${publication.name}" selected!</span>
                      </div>
                    `;
                    document.body.appendChild(successMessage);
                    setTimeout(() => {
                      if (successMessage.parentNode) {
                        successMessage.parentNode.removeChild(successMessage);
                      }
                    }, 3000);
                  }}
                >
                  {publicationId === publication.id && (
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
              <button
                className='btn btn-ghost'
                onClick={() => setShowPublicationSelector(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Settings Modal */}
      {showSettings && (
        <div className='modal modal-open'>
          <div className='modal-box max-w-2xl'>
            <h3 className='font-bold text-lg mb-4'>
              Connect to{' '}
              {
                platformConfig[showSettings as keyof typeof platformConfig]
                  ?.name
              }
            </h3>

            <div className='space-y-6'>
              {/* Platform-specific connection instructions */}
              {showSettings === 'devto' && (
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
                      onChange={e => setApiKey(e.target.value)}
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

              {showSettings === 'hashnode' && (
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
                      onChange={e => setApiKey(e.target.value)}
                      className='input input-bordered w-full'
                    />
                  </div>

                  <div>
                    <label className='label'>
                      <span className='label-text'>
                        Publication ID (Optional)
                      </span>
                    </label>
                    <input
                      type='text'
                      placeholder='Enter your publication ID if you have multiple publications'
                      value={publicationId}
                      onChange={e => setPublicationId(e.target.value)}
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

              {showSettings === 'beehiiv' && (
                <div className='space-y-4'>
                  <div className='alert alert-info'>
                    <div>
                      <h4 className='font-semibold'>Beehiiv API Key</h4>
                      <p className='text-sm mt-2'>
                        Get your API key from{' '}
                        <a
                          href='https://app.beehiiv.com/settings/workspace/api'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='link link-primary'
                        >
                          app.beehiiv.com/settings/api
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
                      placeholder='Enter your Beehiiv API key'
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      className='input input-bordered w-full'
                    />
                  </div>

                  <div>
                    <label className='label'>
                      <span className='label-text'>
                        Publication ID (Optional)
                      </span>
                    </label>
                    <input
                      type='text'
                      placeholder='Enter your publication ID if you have multiple publications'
                      value={publicationId}
                      onChange={e => setPublicationId(e.target.value)}
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

              {/* Publishing Defaults */}
              <div>
                <h4 className='font-semibold mb-3'>Publishing Defaults</h4>
                <div className='space-y-4'>
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
            </div>

            <div className='modal-action'>
              <button
                className='btn btn-ghost'
                onClick={() => {
                  setShowSettings(null);
                  setApiKey('');
                  setPublicationId('');
                  setSelectedPublicationName('');
                }}
                disabled={connecting === showSettings}
              >
                Cancel
              </button>
              <button
                className='btn btn-primary'
                onClick={handleSaveSettings.bind(null, showSettings as string)}
                disabled={
                  connecting === showSettings || !showSettings || !apiKey.trim()
                }
              >
                {connecting === showSettings ? (
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
      )}
    </div>
  );
}
