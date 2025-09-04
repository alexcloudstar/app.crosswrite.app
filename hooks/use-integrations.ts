import { useState, useEffect } from 'react';
import {
  connectIntegration,
  disconnectIntegration,
  getPlatformPublications,
  listIntegrations,
  testIntegration,
} from '@/app/actions/integrations';
import { platformConfig } from '@/lib/config/platforms';
import toast from 'react-hot-toast';

type Integration = {
  id: string;
  platform: string;
  status: string;
  connectedAt?: Date;
  lastSync?: Date;
};

type Publication = {
  id: string;
  name: string;
  description?: string;
  domain?: string;
};

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    async function loadIntegrations() {
      try {
        const result = await listIntegrations();
        if (result.success && result.data) {
          setIntegrations(result.data as Integration[]);
        }
      } catch {
        toast.error('Failed to load integrations');
      } finally {
        setLoading(false);
      }
    }

    loadIntegrations();
  }, []);

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

  const handleConnect = (platform: string) => {
    // This will be handled by the modal
  };

  const handleDisconnect = async (platform: string) => {
    setConnecting(platform);
    try {
      const result = await disconnectIntegration({ platform });

      if (result.success) {
        const reloadResult = await listIntegrations();
        if (reloadResult.success && reloadResult.data) {
          setIntegrations(reloadResult.data as Integration[]);
        }
        toast.success(`Successfully disconnected from ${platform}`);
      }

      if (!result.success) {
        toast.error(`Failed to disconnect: ${result.error}`);
      }
    } catch {
      toast.error('Failed to disconnect. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  const handleTestConnection = async (platform: string) => {
    setTesting(platform);
    try {
      const result = await testIntegration({ platform });

      if (result.success) {
        toast.success(`Connection to ${platform} is working!`);
      }

      if (!result.success) {
        toast.error(`Connection test failed: ${result.error}`);
      }
    } catch {
      toast.error('Failed to test connection. Please try again.');
    } finally {
      setTesting(null);
    }
  };

  const handleLoadPublications = async (platform: string) => {
    try {
      const result = await getPlatformPublications({ platform });

      if (result.success && result.data) {
        const rawPublications = (
          result.data as {
            publications: Array<{
              _id: string;
              title: string;
              description?: string;
              domain?: string;
            }>;
          }
        ).publications;

        const transformedPublications = rawPublications.map(pub => ({
          id: pub._id,
          name: pub.title,
          description: pub.description,
          domain: pub.domain,
        }));

        setPublications(transformedPublications);
      }

      if (!result.success) {
        toast.error(`Failed to load publications: ${result.error}`);
      }
    } catch {
      toast.error('Failed to load publications. Please try again.');
    }
  };

  const handleSaveSettings = async (
    platform: string,
    apiKey: string,
    publicationId?: string
  ) => {
    setConnecting(platform);

    try {
      if (!apiKey.trim()) {
        toast.error('API key is required');
        return;
      }

      let integrationData: {
        platform: string;
        apiKey: string;
        publicationId?: string;
      } = {
        platform,
        apiKey: apiKey.trim(),
      };

      switch (platform) {
        case 'hashnode':
          integrationData = {
            ...integrationData,
            publicationId: publicationId?.trim() || undefined,
          };
          break;
      }

      const result = await connectIntegration(integrationData);

      if (result.success) {
        const reloadResult = await listIntegrations();
        if (reloadResult.success && reloadResult.data) {
          setIntegrations(reloadResult.data as Integration[]);
        }
        toast.success(`Successfully connected to ${platform}`);
      }

      if (!result.success) {
        toast.error(`Failed to connect: ${result.error}`);
      }
    } catch {
      toast.error('Failed to connect. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  return {
    integrations,
    loading,
    connecting,
    testing,
    publications,
    getPlatformsWithStatus,
    handleConnect,
    handleDisconnect,
    handleTestConnection,
    handleLoadPublications,
    handleSaveSettings,
  };
}
