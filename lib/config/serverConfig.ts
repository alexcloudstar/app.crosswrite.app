// Server-only configuration for deployment modes and API keys
// This file should never be imported on the client side

type DeploymentMode = 'HOSTED' | 'SELF_HOST';

// Cached values read at process start
let cachedDeploymentMode: DeploymentMode | null = null;
let cachedHostedAppKey: string | null = null;
let cachedSelfHostKey: string | null = null;

function getDeploymentMode(): DeploymentMode {
  if (cachedDeploymentMode === null) {
    const mode = process.env.CROSSWRITE_DEPLOYMENT_MODE;
    if (mode === 'HOSTED' || mode === 'SELF_HOST') {
      cachedDeploymentMode = mode;
    } else {
      // Default to HOSTED if not specified
      cachedDeploymentMode = 'HOSTED';
    }
  }
  return cachedDeploymentMode;
}

export const isHosted = (): boolean => getDeploymentMode() === 'HOSTED';

export const isSelfHost = (): boolean => getDeploymentMode() === 'SELF_HOST';

export const getHostedAppKey = (): string => {
  if (cachedHostedAppKey === null) {
    const key = process.env.OPENAI_API_KEY_APP;

    if (!key) {
      throw new Error('OPENAI_API_KEY_APP is required in HOSTED mode');
    }

    cachedHostedAppKey = key;
  }
  return cachedHostedAppKey;
};

export const getSelfHostKey = (): string => {
  if (cachedSelfHostKey === null) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY is required in SELF_HOST mode');
    }
    cachedSelfHostKey = key;
  }
  return cachedSelfHostKey;
};

export const getApiKeyForGeneration = (): string => {
  if (isHosted()) {
    return getHostedAppKey();
  }

  return getSelfHostKey();
};

export const getKeySource = (): 'hosted-app-key' | 'self-host-env-key' =>
  isHosted() ? 'hosted-app-key' : 'self-host-env-key';
