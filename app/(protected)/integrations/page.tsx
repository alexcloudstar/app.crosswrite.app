'use client';

import {
  IntegrationsHeader,
  PlatformCard,
  ConnectionModal,
  PublicationSelector,
} from '@/components/integrations';
import { useIntegrations } from '@/hooks/use-integrations';
import { useState } from 'react';

export default function IntegrationsPage() {
  const {
    loading,
    connecting,
    testing,
    publications,
    getPlatformsWithStatus,
    handleDisconnect,
    handleTestConnection,
    handleLoadPublications,
    handleSaveSettings,
  } = useIntegrations();

  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [setAsCanonical, setSetAsCanonical] = useState(false);
  const [publishAsDraft, setPublishAsDraft] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [publicationId, setPublicationId] = useState('');
  const [showPublicationSelector, setShowPublicationSelector] = useState(false);
  const [selectedPublicationName, setSelectedPublicationName] =
    useState<string>('');

  const handleConnectClick = (platform: string) => {
    setShowSettings(platform);
  };

  const handleLoadPublicationsClick = async (platform: string) => {
    await handleLoadPublications(platform);
    setShowPublicationSelector(true);
  };

  const handleSaveSettingsClick = async (platform: string) => {
    await handleSaveSettings(platform, apiKey, publicationId);
    setApiKey('');
    setPublicationId('');
    setSelectedPublicationName('');
    setShowSettings(null);
  };

  const handleCloseSettings = () => {
    setShowSettings(null);
    setApiKey('');
    setPublicationId('');
    setSelectedPublicationName('');
  };

  const handleSelectPublication = (publication: {
    id: string;
    name: string;
  }) => {
    setPublicationId(publication.id);
    setSelectedPublicationName(publication.name);
    setShowPublicationSelector(false);

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
  };

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <IntegrationsHeader />

      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='loading loading-spinner loading-lg'></div>
          <span className='ml-4 text-base-content/70'>
            Loading integrations...
          </span>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {getPlatformsWithStatus().map(platform => (
            <PlatformCard
              key={platform.platform}
              platform={platform}
              connecting={connecting}
              testing={testing}
              selectedPublicationName={selectedPublicationName}
              onConnect={handleConnectClick}
              onDisconnect={handleDisconnect}
              onShowSettings={setShowSettings}
              onTestConnection={handleTestConnection}
              onLoadPublications={handleLoadPublicationsClick}
            />
          ))}
        </div>
      )}

      <PublicationSelector
        isOpen={showPublicationSelector}
        publications={publications}
        selectedPublicationId={publicationId}
        onClose={() => setShowPublicationSelector(false)}
        onSelectPublication={handleSelectPublication}
      />

      <ConnectionModal
        isOpen={!!showSettings}
        platform={showSettings}
        apiKey={apiKey}
        publicationId={publicationId}
        setAsCanonical={setAsCanonical}
        publishAsDraft={publishAsDraft}
        connecting={connecting}
        onClose={handleCloseSettings}
        onApiKeyChange={setApiKey}
        onPublicationIdChange={setPublicationId}
        onSetAsCanonicalChange={setSetAsCanonical}
        onPublishAsDraftChange={setPublishAsDraft}
        onSave={handleSaveSettingsClick}
      />
    </div>
  );
}
