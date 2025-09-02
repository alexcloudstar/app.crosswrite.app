import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db/client';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});
import { billingCustomers, billingSubscriptions } from '@/db/schema/billing';
import { users } from '@/db/schema/auth';
import { eq, and } from 'drizzle-orm';
import { invalidateBillingCache } from '@/app/actions/billing';
import logger from '@/lib/logger';
import { getPlanFromPriceId } from '@/lib/billing/plans';
import { planIdToDatabasePlan, type PlanId } from '@/lib/plans';

function safeStripeTimestamp(
  timestamp: number | null | undefined
): Date | null {
  if (!timestamp || timestamp <= 0) {
    logger.warn('Invalid timestamp value:', {
      timestamp,
      type: typeof timestamp,
    });
    return null;
  }

  try {
    const date = new Date(timestamp * 1000);

    if (isNaN(date.getTime())) {
      logger.warn('Invalid date after conversion:', {
        timestamp,
        convertedToMs: timestamp * 1000,
        date: date.toString(),
        dateTime: date.getTime(),
      });
      return null;
    }

    return date;
  } catch (error) {
    logger.error('Invalid timestamp conversion:', { timestamp, error });
    return null;
  }
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    logger.error('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    logger.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        logger.info('Processing subscription update:', {
          subscriptionId: event.data.object.id,
          status: event.data.object.status,
          cancelAtPeriodEnd: event.data.object.cancel_at_period_end,
        });
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.client_reference_id;
  if (!userId) {
    logger.error('No client_reference_id in checkout session');
    return;
  }

  const customer = await db
    .select({ id: billingCustomers.id })
    .from(billingCustomers)
    .where(eq(billingCustomers.userId, userId))
    .limit(1);

  if (!customer[0]) {
    await db.insert(billingCustomers).values({
      userId,
      stripeCustomerId: session.customer as string,
    });
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  const currentPeriodStart = safeStripeTimestamp(
    subscription.items.data[0].current_period_start
  );
  const currentPeriodEnd = safeStripeTimestamp(
    subscription.items.data[0].current_period_end
  );

  if (!currentPeriodStart || !currentPeriodEnd) {
    const rawStart = subscription.items.data[0].current_period_start;
    const rawEnd = subscription.items.data[0].current_period_end;

    logger.error('Invalid subscription timestamps:', {
      subscriptionId: subscription.id,
      currentPeriodStart: rawStart,
      currentPeriodEnd: rawEnd,
      currentPeriodStartType: typeof rawStart,
      currentPeriodEndType: typeof rawEnd,
      subscriptionStatus: subscription.status,
      subscriptionObject: JSON.stringify(subscription, null, 2),
    });
    return;
  }

  await db
    .insert(billingSubscriptions)
    .values({
      userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      planPriceId: subscription.items.data[0].price.id,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
    .onConflictDoUpdate({
      target: [billingSubscriptions.stripeSubscriptionId],
      set: {
        status: subscription.status,
        planPriceId: subscription.items.data[0].price.id,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });

  if (subscription.status === 'active') {
    const planId = getPlanFromPriceId(subscription.items.data[0].price.id);
    if (planId) {
      const planTier = planIdToDatabasePlan(planId as PlanId);
      await db.update(users).set({ planTier }).where(eq(users.id, userId));
    }
  }

  invalidateBillingCache(userId);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = await db
    .select({ userId: billingCustomers.userId })
    .from(billingCustomers)
    .where(
      eq(billingCustomers.stripeCustomerId, subscription.customer as string)
    )
    .limit(1);

  if (!customer[0]) {
    logger.error('Customer not found for subscription:', subscription.id);
    return;
  }

  const currentPeriodStart = safeStripeTimestamp(
    subscription.items.data[0].current_period_start
  );
  const currentPeriodEnd = safeStripeTimestamp(
    subscription.items.data[0].current_period_end
  );

  if (!currentPeriodStart || !currentPeriodEnd) {
    const rawStart = subscription.items.data[0].current_period_start;
    const rawEnd = subscription.items.data[0].current_period_end;

    logger.error('Invalid subscription timestamps:', {
      subscriptionId: subscription.id,
      currentPeriodStart: rawStart,
      currentPeriodEnd: rawEnd,
      currentPeriodStartType: typeof rawStart,
      currentPeriodEndType: typeof rawEnd,
      subscriptionStatus: subscription.status,
      subscriptionObject: JSON.stringify(subscription, null, 2),
    });
    return;
  }

  await db
    .insert(billingSubscriptions)
    .values({
      userId: customer[0].userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      planPriceId: subscription.items.data[0].price.id,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
    .onConflictDoUpdate({
      target: [billingSubscriptions.stripeSubscriptionId],
      set: {
        status: subscription.status,
        planPriceId: subscription.items.data[0].price.id,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });

  logger.info('Updating user plan tier:', {
    userId: customer[0].userId,
    subscriptionStatus: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  if (subscription.status === 'active' && !subscription.cancel_at_period_end) {
    const planId = getPlanFromPriceId(subscription.items.data[0].price.id);
    if (planId) {
      const planTier = planIdToDatabasePlan(planId as PlanId);
      logger.info('Setting user to plan tier:', { planTier, planId });
      await db
        .update(users)
        .set({ planTier })
        .where(eq(users.id, customer[0].userId));
    }
  } else {
    plan;
    logger.info('Setting user to free plan due to subscription status:', {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
    await db
      .update(users)
      .set({ planTier: 'free' })
      .where(eq(users.id, customer[0].userId));
  }

  invalidateBillingCache(customer[0].userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await db
    .select({ userId: billingCustomers.userId })
    .from(billingCustomers)
    .where(
      eq(billingCustomers.stripeCustomerId, subscription.customer as string)
    )
    .limit(1);

  if (!customer[0]) {
    logger.error(
      'Customer not found for deleted subscription:',
      subscription.id
    );
    return;
  }

  await db
    .update(billingSubscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(billingSubscriptions.stripeSubscriptionId, subscription.id));

  await db
    .update(users)
    .set({ planTier: 'free' })
    .where(eq(users.id, customer[0].userId));

  invalidateBillingCache(customer[0].userId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customer = await db
    .select({ userId: billingCustomers.userId })
    .from(billingCustomers)
    .where(eq(billingCustomers.stripeCustomerId, invoice.customer as string))
    .limit(1);

  if (!customer[0]) {
    logger.error('Customer not found for failed payment:', invoice.id);
    return;
  }

  await db
    .update(billingSubscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(billingSubscriptions.userId, customer[0].userId),
        eq(
          billingSubscriptions.stripeSubscriptionId,
          (invoice as unknown as { subscription: string }).subscription
        )
      )
    );

  invalidateBillingCache(customer[0].userId);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customer = await db
    .select({ userId: billingCustomers.userId })
    .from(billingCustomers)
    .where(eq(billingCustomers.stripeCustomerId, invoice.customer as string))
    .limit(1);

  if (!customer[0]) {
    logger.error('Customer not found for successful payment:', invoice.id);
    return;
  }

  const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string })
    .subscription;
  if (subscriptionId) {
    await db
      .update(billingSubscriptions)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(billingSubscriptions.userId, customer[0].userId),
          eq(billingSubscriptions.stripeSubscriptionId, subscriptionId)
        )
      );
  }

  invalidateBillingCache(customer[0].userId);
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  logger.info('Payment intent succeeded:', paymentIntent.id);
}
