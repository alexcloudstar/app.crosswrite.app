// Input size limits for validation across the application
export const INPUT_LIMITS: Record<string, number> = {
  // AI-related limits
  improveText: 8000,
  adjustTone: 6000,
  summarizeText: 10000,
  generateSuggestions: 8000,
  extractTags: 12000,
  generateThumbnail: 20000,

  // Draft-related limits
  draft: 20000,
  draftUpdate: 20000,
  draftPublish: 1000,
  draftSchedule: 5000,
  DRAFT_DATA_SIZE: 20000,
  SEARCH_PARAMETERS_SIZE: 1000,
  PUBLISH_DATA_SIZE: 5000,
  SCHEDULE_DATA_SIZE: 5000,

  // Billing-related limits
  billing: 1000,

  // Scheduler-related limits
  scheduleCreate: 5000,
  scheduleUpdate: 5000,
  scheduleBulk: 50000,
  scheduleDelete: 1000,

  // Integration-related limits
  integrationCreate: 5000,
  integrationUpdate: 5000,
  integrationSync: 5000,
  integrationPublish: 2000,
  integrationDelete: 1000,

  // User settings limits
  userSettings: 2000,
  userProfile: 1000,
} as const;

// Field length limits for form inputs and database fields
export const FIELD_LIMITS = {
  // Text fields
  title: 200,
  name: 100,
  bio: 500,
  website: 200,
  priceId: 100,
  publicationId: 100,
  returnPath: 200,
  searchTerm: 100,

  // API and tokens
  apiKey: 500,
  apiSecret: 500,
  accessToken: 1000,
  refreshToken: 1000,
  webhookUrl: 500,

  // Content fields
  content: 15000,
  contentPreview: 500,
  seoDescription: 160,

  // Limits and counts
  maxSuggestions: 10,
  maxTags: 5,
  maxJobs: 100,
  maxSchedules: 10,
  syncIntervalMin: 30,
  syncIntervalMax: 1440,

  // AI model configuration
  maxTokens: {
    default: 1000,
    summarize: 1500,
    suggestions: 1500,
    extractTags: 500,
    improveText: 2000,
  },

  // Content preview lengths
  contentPreviewLength: 100,
  aiLogPreviewLength: 100,
} as const;

// Time and delay constants
export const TIMING = {
  // Retry and backoff
  retryBaseDelay: 30000, // 30 seconds
  retryMaxDelay: 120000, // 2 minutes
  retryJitterFactor: 0.1,

  // UI delays
  commandPaletteDelay: 100,
  editorAutoSaveDelay: 1000,
  integrationTimeout: 1000,

  // Scheduler
  maxRetries: 3,
  backoffMultiplier: 2,

  // Rate limiting
  rateLimitWindow: 60000, // 1 minute
  rateLimitMaxRequests: 5,
} as const;

// UI and styling constants
export const UI = {
  // Card styling
  cardBaseClasses: 'card bg-base-100 border border-base-300 shadow-sm',
  cardHoverClasses:
    'hover:shadow-md transition-all duration-200 hover:border-primary/50',

  // Icon sizes
  iconSizes: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 48,
  },

  // Animation durations
  transitionDuration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
} as const;

// Platform and integration constants
export const PLATFORMS = {
  // Sync intervals (in minutes)
  syncIntervals: {
    min: 30,
    max: 1440, // 24 hours
    default: 60,
  },

  // Retry configuration
  maxRetries: 2,
  baseDelay: 1000,
} as const;
