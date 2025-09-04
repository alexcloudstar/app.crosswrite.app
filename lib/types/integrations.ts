export type Integration = {
  id: string;
  userId?: string;
  platform: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;
  publicationId?: string;
  status: 'connected' | 'disconnected' | 'error';
  autoPublish: boolean;
  syncInterval: number;
  connectedAt?: Date;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type IntegrationListItem = {
  id: string;
  platform: string;
  status: string;
  connectedAt?: Date;
  lastSync?: Date;
};

export type CreateIntegrationRequest = {
  platform: string;
  apiKey: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;
  publicationId?: string;
  autoPublish?: boolean;
  syncInterval?: number;
};

export type UpdateIntegrationRequest = {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;
  publicationId?: string;
  status?: string;
  autoPublish?: boolean;
  syncInterval?: number;
};

export type PublishResult = {
  results: Array<{
    platform: string;
    success: boolean;
    platformPostId?: string;
    platformUrl?: string;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    draftId: string;
  };
};
