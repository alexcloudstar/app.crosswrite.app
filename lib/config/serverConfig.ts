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

export function isHosted(): boolean {
  return getDeploymentMode() === 'HOSTED';
}

export function isSelfHost(): boolean {
  return getDeploymentMode() === 'SELF_HOST';
}

export function getHostedAppKey(): string {
  if (cachedHostedAppKey === null) {
    const key = process.env.OPENAI_API_KEY_APP;

    if (!key) {
      throw new Error('OPENAI_API_KEY_APP is required in HOSTED mode');
    }

    cachedHostedAppKey = key;
  }
  return cachedHostedAppKey;
}

export function getSelfHostKey(): string {
  if (cachedSelfHostKey === null) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY is required in SELF_HOST mode');
    }
    cachedSelfHostKey = key;
  }
  return cachedSelfHostKey;
}

export function getApiKeyForGeneration(): string {
  if (isHosted()) {
    return getHostedAppKey();
  }

  return getSelfHostKey();
}

export function getKeySource(): 'hosted-app-key' | 'self-host-env-key' {
  return isHosted() ? 'hosted-app-key' : 'self-host-env-key';
}
