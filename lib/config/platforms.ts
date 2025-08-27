// Centralized platform configuration
export const supportedPlatforms = ['devto', 'hashnode'] as const;

export type Platform = typeof supportedPlatforms[number];

export const platformConfig = {
  devto: {
    name: 'Dev.to',
    displayName: 'dev.to',
    description: 'Connect your dev.to account to publish articles directly',
    color: 'bg-purple-500',
    icon: 'DEV',
    url: 'https://dev.to',
    apiKeyUrl: 'https://dev.to/settings/account',
    supportsPublications: false,
    supportsDrafts: true,
  },
  hashnode: {
    name: 'Hashnode',
    displayName: 'Hashnode',
    description: "Share your content on Hashnode's developer community",
    color: 'bg-purple-600',
    icon: 'H',
    url: 'https://hashnode.com',
    apiKeyUrl: 'https://hashnode.com/settings/developer',
    supportsPublications: true,
    supportsDrafts: true,
  },
} as const;

export function getPlatformConfig(platform: Platform) {
  return platformConfig[platform];
}

export function getPlatformDisplayName(platform: Platform): string {
  return platformConfig[platform].displayName;
}

export function getPlatformColor(platform: Platform): string {
  return platformConfig[platform].color;
}

export function isPlatformSupported(platform: string): platform is Platform {
  return supportedPlatforms.includes(platform as Platform);
}
