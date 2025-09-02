import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Enable server-side performance monitoring
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express(),
  ],
  
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
  
  // Don't send sensitive data
  defaultTags: {
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
  },
  
  // Set maximum event size
  maxBreadcrumbs: 50,
});
