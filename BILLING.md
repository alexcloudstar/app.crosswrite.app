# Billing & Subscription Implementation

This document describes the Stripe billing implementation for Cross Write.

## Overview

The billing system uses Stripe as the source of truth for subscriptions, with a local database mirror for fast reads and usage tracking.

## Architecture

### Database Tables

- `billing_customers` - Maps users to Stripe customers
- `billing_subscriptions` - Mirrors Stripe subscription data
- `user_usage` - Monthly usage tracking (existing)

### Key Components

- **Server Actions** (`app/actions/billing.ts`) - Checkout, portal, plan management
- **Webhook Handler** (`app/api/stripe/webhook/route.ts`) - Processes Stripe events
- **Usage Enforcement** (`lib/billing/usage.ts`) - Plan limits and usage tracking
- **Stripe Client** (`lib/billing/stripe.ts`) - Stripe SDK configuration

## Environment Variables

Required for production:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
APP_URL=https://yourdomain.com
```

For development:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Stripe Dashboard Setup

1. Create a Stripe account and get your API keys
2. Create a Product in Stripe with a recurring price for the Pro plan
3. Copy the price ID to your environment variables
4. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
5. Configure webhook events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 2. Database Migration

Run the migration to create billing tables:

```bash
npm run db:generate
npm run db:push
```

### 3. Railway Deployment

1. Set environment variables in Railway dashboard
2. Deploy the application
3. Update webhook URL in Stripe dashboard to use production URL

## Usage Flows

### Subscription Flow

1. User clicks "Upgrade to Pro" on billing page
2. `createCheckoutSession` action creates Stripe checkout
3. User completes payment on Stripe
4. Webhook processes `checkout.session.completed`
5. Database updated with subscription details
6. User redirected back with success message

### Billing Portal Flow

1. User clicks "Manage Subscription" or "Downgrade"
2. `createBillingPortalSession` action creates portal session
3. User manages subscription in Stripe portal
4. Webhook processes subscription changes
5. Database updated automatically

### Usage Enforcement

- AI features check `aiSuggestionsUsed` limits
- Thumbnail generation checks `thumbnailsGenerated` limits
- Article publishing checks `articlesPublished` limits
- Limits enforced per plan tier (Free vs Pro)

## Plan Tiers

### Free Plan
- 5 articles/month
- 3 AI thumbnails/month
- 500 AI suggestions/month
- 1 platform integration

### Pro Plan ($14/month)
- 200 articles/month
- 50 AI thumbnails/month
- 5000 AI suggestions/month
- All platform integrations
- Priority support

## Security

- All Stripe operations use server actions (no client-side secrets)
- Webhook signature verification
- User-scoped operations with authentication
- Idempotent webhook processing
- No sensitive data logged

## Monitoring

- Usage tracking in `user_usage` table
- Error logging via Winston logger
- Cache invalidation on subscription changes

## Development

For local development with Stripe webhooks:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Use the webhook secret from CLI output
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL in Stripe dashboard
   - Verify webhook secret in environment
   - Check Railway logs for errors

2. **Usage limits not working**
   - Verify `user_usage` table has correct data
   - Check plan determination logic
   - Ensure webhook is updating subscription status

3. **Checkout not working**
   - Verify `STRIPE_PRICE_PRO` is set correctly
   - Check `APP_URL` environment variable
   - Ensure Stripe account is properly configured
