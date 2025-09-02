import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Ignore certain errors
  beforeSend(event) {
    // Ignore validation errors (these are expected)
    if (event.exception?.values?.[0]?.value?.includes('ZodError')) {
      return null;
    }

    // Ignore authentication errors (these are expected)
    if (event.exception?.values?.[0]?.value?.includes('Unauthorized')) {
      return null;
    }

    return event;
  },

  // Set maximum event size
  maxBreadcrumbs: 50,
});
