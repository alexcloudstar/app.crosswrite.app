import { z } from 'zod';
import { validatePayloadSize } from './common';
import { INPUT_LIMITS } from '@/lib/constants';

export const createCheckoutSessionSchema = z
  .object({
    priceId: z
      .string()
      .min(1, 'Price ID is required')
      .max(100, 'Price ID too long'),
    returnPath: z
      .string()
      .max(200, 'Return path too long')
      .optional()
      .default('/settings/billing'),
  })
  .refine(data => validatePayloadSize(data, INPUT_LIMITS.billing), {
    message: 'Checkout data too large',
  });

export const createBillingPortalSessionSchema = z
  .object({
    returnPath: z
      .string()
      .max(200, 'Return path too long')
      .optional()
      .default('/settings/billing'),
  })
  .refine(data => validatePayloadSize(data, INPUT_LIMITS.billing), {
    message: 'Portal data too large',
  });

export const changePlanSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;
export type CreateBillingPortalSessionInput = z.infer<
  typeof createBillingPortalSessionSchema
>;
export type ChangePlanInput = z.infer<typeof changePlanSchema>;
