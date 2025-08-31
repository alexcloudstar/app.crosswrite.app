'use server';

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

const STRIPE_PRICE_IDS = {
  PRO: process.env.STRIPE_PRICE_PRO,
} as const;

const ALLOWED_PRICE_IDS = Object.values(STRIPE_PRICE_IDS).filter(Boolean);

function validatePriceId(priceId: string): boolean {
  return ALLOWED_PRICE_IDS.includes(priceId);
}

function getAppUrl(): string {
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    throw new Error('APP_URL environment variable is not set');
  }
  return appUrl.replace(/\/$/, '');
}

function createSuccessUrl(returnPath: string = '/settings/billing'): string {
  return `${getAppUrl()}${returnPath}?success=true`;
}

function createCancelUrl(returnPath: string = '/settings/billing'): string {
  return `${getAppUrl()}${returnPath}?canceled=true`;
}

function createBillingPortalReturnUrl(
  returnPath: string = '/settings/billing'
): string {
  return `${getAppUrl()}${returnPath}`;
}
import { db } from '@/db/client';
import { billingCustomers, billingSubscriptions } from '@/db/schema/billing';
import { users } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import { requireAuth, successResult, errorResult } from './_utils';
import {
  createCheckoutSessionSchema,
  createBillingPortalSessionSchema,
  changePlanSchema,
} from '@/lib/validators/billing';
import { getUserPlanId } from '@/lib/billing/usage';

type BillingSummaryData = {
  planId: string;
  subscription: {
    status: string;
    planPriceId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean | null;
  } | null;
  hasActiveSubscription: boolean;
};

const billingSummaryCache = new Map<
  string,
  { data: BillingSummaryData; timestamp: number }
>();

export async function createCheckoutSession(input: {
  priceId: string;
  returnPath?: string;
}) {
  try {
    const session = await requireAuth();
    const validated = createCheckoutSessionSchema.parse(input);

    if (!validatePriceId(validated.priceId)) {
      return errorResult('Invalid price ID');
    }

    const customer = await db
      .select({ stripeCustomerId: billingCustomers.stripeCustomerId })
      .from(billingCustomers)
      .where(eq(billingCustomers.userId, session.id))
      .limit(1);

    let stripeCustomerId: string;

    if (customer[0]) {
      stripeCustomerId = customer[0].stripeCustomerId;
    } else {
      const user = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, session.id))
        .limit(1);

      const stripeCustomer = await stripe.customers.create({
        email: user[0]?.email || undefined,
        metadata: {
          userId: session.id,
        },
      });

      await db.insert(billingCustomers).values({
        userId: session.id,
        stripeCustomerId: stripeCustomer.id,
      });

      stripeCustomerId = stripeCustomer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: validated.priceId,
          quantity: 1,
        },
      ],
      success_url: await createSuccessUrl(validated.returnPath),
      cancel_url: await createCancelUrl(validated.returnPath),
      client_reference_id: session.id,
      allow_promotion_codes: true,
    });

    billingSummaryCache.delete(session.id);

    return successResult({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return errorResult('Failed to create checkout session');
  }
}

export async function createBillingPortalSession(input: {
  returnPath?: string;
}) {
  try {
    const session = await requireAuth();
    const validated = createBillingPortalSessionSchema.parse(input);

    const customer = await db
      .select({ stripeCustomerId: billingCustomers.stripeCustomerId })
      .from(billingCustomers)
      .where(eq(billingCustomers.userId, session.id))
      .limit(1);

    if (!customer[0]) {
      return errorResult('No billing account found');
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer[0].stripeCustomerId,
      return_url: await createBillingPortalReturnUrl(validated.returnPath),
    });

    return successResult({ url: portalSession.url });
  } catch (error) {
    console.error('Billing portal session creation error:', error);
    return errorResult('Failed to create billing portal session');
  }
}

export async function getBillingSummary() {
  try {
    const session = await requireAuth();

    const cached = billingSummaryCache.get(session.id);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return successResult(cached.data);
    }

    const planId = await getUserPlanId(session.id);

    const subscription = await db
      .select({
        status: billingSubscriptions.status,
        planPriceId: billingSubscriptions.planPriceId,
        currentPeriodStart: billingSubscriptions.currentPeriodStart,
        currentPeriodEnd: billingSubscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: billingSubscriptions.cancelAtPeriodEnd,
      })
      .from(billingSubscriptions)
      .where(eq(billingSubscriptions.userId, session.id))
      .limit(1);

    const summary = {
      planId,
      subscription: subscription[0] || null,
      hasActiveSubscription: subscription[0]?.status === 'active',
    };

    billingSummaryCache.set(session.id, {
      data: summary,
      timestamp: Date.now(),
    });

    return successResult(summary);
  } catch (error) {
    console.error('Billing summary error:', error);
    return errorResult('Failed to get billing summary');
  }
}

export async function changePlan(input: { priceId: string }) {
  try {
    const session = await requireAuth();
    const validated = changePlanSchema.parse(input);

    if (!validatePriceId(validated.priceId)) {
      return errorResult('Invalid price ID');
    }

    const subscription = await db
      .select({
        stripeSubscriptionId: billingSubscriptions.stripeSubscriptionId,
      })
      .from(billingSubscriptions)
      .where(eq(billingSubscriptions.userId, session.id))
      .limit(1);

    if (!subscription[0]) {
      return errorResult('No active subscription found');
    }

    await stripe.subscriptions.update(subscription[0].stripeSubscriptionId, {
      items: [
        {
          id: (
            await stripe.subscriptions.retrieve(
              subscription[0].stripeSubscriptionId
            )
          ).items.data[0].id,
          price: validated.priceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    billingSummaryCache.delete(session.id);

    return successResult({ success: true });
  } catch (error) {
    console.error('Plan change error:', error);
    return errorResult('Failed to change plan');
  }
}

export const invalidateBillingCache = async (userId: string) =>
  billingSummaryCache.delete(userId);
