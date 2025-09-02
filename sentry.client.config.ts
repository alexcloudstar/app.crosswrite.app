import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay (optional)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Ignore certain errors
  beforeSend(event) {
    // Ignore network errors and aborted requests
    if (event.exception?.values?.[0]?.value?.includes('fetch')) {
      return null;
    }
    if (event.exception?.values?.[0]?.value?.includes('aborted')) {
      return null;
    }
    return event;
  },
  
  // Don't send sensitive data
  defaultTags: {
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  },
});
