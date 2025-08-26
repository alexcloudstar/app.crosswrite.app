'use server';

import {
  isHosted,
  getHostedAppKey,
  getSelfHostKey,
} from '@/lib/config/serverConfig';

export async function getDeploymentConfig() {
  try {
    const mode = isHosted() ? 'HOSTED' : 'SELF_HOST';

    // Check if required keys are present
    let hasRequiredKey = false;
    try {
      if (isHosted()) {
        getHostedAppKey();
        hasRequiredKey = true;

        return;
      }

      getSelfHostKey();
      hasRequiredKey = true;
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
