'use client';

import {
  IntegrationsHeader,
  PlatformCard,
  ConnectionModal,
  PublicationSelector,
} from '@/components/integrations';
import { useIntegrations } from '@/hooks/use-integrations';
import { useState } from 'react';
import toast from 'react-hot-toast';

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

    toast.success(`Publication "${publication.name}" selected!`);
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
