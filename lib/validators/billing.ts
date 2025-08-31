import { z } from 'zod';

export const createCheckoutSessionSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  returnPath: z.string().optional().default('/settings/billing'),
});

export const createBillingPortalSessionSchema = z.object({
  returnPath: z.string().optional().default('/settings/billing'),
});

export const changePlanSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type CreateBillingPortalSessionInput = z.infer<typeof createBillingPortalSessionSchema>;
export type ChangePlanInput = z.infer<typeof changePlanSchema>;
