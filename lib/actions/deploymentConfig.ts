'use server';

import {
  isHosted,
  getHostedAppKey,
  getSelfHostKey,
} from '@/lib/config/serverConfig';

type DeploymentConfig = {
  mode: 'HOSTED' | 'SELF_HOST';
  hasRequiredKey: boolean;
};

export async function getDeploymentConfig(): Promise<DeploymentConfig> {
  try {
    const mode: 'HOSTED' | 'SELF_HOST' = isHosted() ? 'HOSTED' : 'SELF_HOST';

    let hasRequiredKey = false;
    try {
      if (isHosted()) {
        getHostedAppKey();
        hasRequiredKey = true;
      } else {
        getSelfHostKey();
        hasRequiredKey = true;
      }
    } catch {
      hasRequiredKey = false;
    }

    return {
      mode,
      hasRequiredKey,
    };
  } catch {
    return {
      mode: 'HOSTED' as const,
      hasRequiredKey: false,
    };
  }
}
