// Input size limits for validation across the application
export const INPUT_LIMITS: Record<string, number> = {
  // AI-related limits
  improveText: 20000,
  adjustTone: 15000,
  summarizeText: 25000,
  generateSuggestions: 15000,
  extractTags: 20000,
  generateThumbnail: 30000,

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
  devtoTagLength: 20,
  maxSummaryLength: 1000,
  defaultSummaryLength: 200,
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

// AI model configuration constants
export const AI_MODEL = {
  // Temperature settings for different tasks
  temperature: {
    default: 0.7,
    creative: 0.8,
    focused: 0.5,
    precise: 0.3,
  },

  // Model types
  models: {
    default: 'gpt-4o-mini',
    advanced: 'gpt-4o',
    legacy: 'gpt-3.5-turbo',
  } as const,

  // Image generation sizes
  imageSizes: {
    square: '1024x1024',
    landscape: '1792x1024',
    portrait: '1024x1792',
  } as const,

  // Content analysis thresholds
  contentThresholds: {
    maxContentForAnalysis: 11000,
    maxContentForSuggestions: 8000,
    maxContentForExtraction: 6000,
  },
} as const;

// Time constants for date calculations and intervals
export const TIME = {
  // Seconds
  seconds: {
    minute: 60,
    hour: 3600,
    day: 86400,
    month: 2592000, // 30 days
  },

  // Minutes
  minutes: {
    hour: 60,
    day: 1440,
    week: 10080,
    month: 43200, // 30 days
  },

  // Milliseconds
  milliseconds: {
    second: 1000,
    minute: 60000,
    hour: 3600000,
    day: 86400000,
  },
} as const;

// Plan and usage limits
export const PLAN_LIMITS = {
  // Free plan
  free: {
    articlesPublished: 5,
    aiSuggestionsUsed: 500,
    thumbnailsGenerated: 10,
  },

  // Pro plan
  pro: {
    articlesPublished: 200,
    aiSuggestionsUsed: 5000,
    thumbnailsGenerated: 50,
  },

  // Usage warning thresholds (percentage)
  warningThresholds: {
    low: 0.5, // 50%
    medium: 0.8, // 80%
    high: 0.9, // 90%
  },
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  // Default rate limits
  default: {
    requests: 10,
    windowMs: 60000, // 1 minute
  },

  // AI-specific rate limits
  ai: {
    requests: 5,
    windowMs: 60000,
  },

  // Integration rate limits
  integration: {
    requests: 10,
    windowMs: 60000,
  },

  // Scheduler rate limits
  scheduler: {
    requests: 20,
    windowMs: 60000,
  },
} as const;

// Scheduler configuration
export const SCHEDULER_CONFIG = {
  // Grace window for scheduled posts (milliseconds)
  graceWindowMs: 60000, // 1 minute

  // Maximum retry attempts
  maxRetries: 3,

  // Retry backoff configuration
  retryBackoff: {
    baseDelay: 30000, // 30 seconds
    maxDelay: 120000, // 2 minutes
    multiplier: 2,
    jitterFactor: 0.1,
  },

  // Bulk operation limits
  bulkLimits: {
    maxSchedules: 10,
    maxJobs: 100,
  },
} as const;

// UI and component configuration
export const COMPONENT_CONFIG = {
  // Pagination defaults
  pagination: {
    defaultLimit: 100,
    maxLimit: 1000,
    defaultPage: 1,
  },

  // Search and filtering
  search: {
    maxSearchTermLength: 100,
    maxFilterOptions: 20,
    debounceDelay: 300,
  },

  // Form validation
  validation: {
    minPasswordLength: 8,
    maxPasswordLength: 128,
    minUsernameLength: 3,
    maxUsernameLength: 30,
  },

  // Toast notifications
  toast: {
    defaultDuration: 4000,
    successDuration: 3000,
    errorDuration: 6000,
  },
} as const;
