type DeploymentMode = 'HOSTED' | 'SELF_HOST';

let cachedDeploymentMode: DeploymentMode | null = null;
let cachedApiKey: string | null = null;

function getDeploymentMode(): DeploymentMode {
  if (cachedDeploymentMode === null) {
    const mode = process.env.CROSSWRITE_DEPLOYMENT_MODE;
    if (mode === 'HOSTED' || mode === 'SELF_HOST') {
      cachedDeploymentMode = mode;
    } else {
      cachedDeploymentMode = 'HOSTED';
    }
  }
  return cachedDeploymentMode;
}

export const isHosted = (): boolean => getDeploymentMode() === 'HOSTED';

export const isSelfHost = (): boolean => getDeploymentMode() === 'SELF_HOST';

export const getApiKey = (): string => {
  if (cachedApiKey === null) {
    const key = process.env.OPENAI_API_KEY;

    if (!key) {
      throw new Error('OPENAI_API_KEY is required for AI functionality');
    }

    cachedApiKey = key;
  }
  return cachedApiKey;
};

export const getApiKeyForGeneration = (): string => {
  return getApiKey();
};

export const getKeySource = (): 'env-key' => 'env-key';
