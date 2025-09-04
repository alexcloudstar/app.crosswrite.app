'use server';

import { planService } from '@/lib/plan-service';
import { requireAuth, successResult, errorResult } from './_utils';

export async function getUserPlanData() {
  try {
    const session = await requireAuth();
    const userPlan = await planService.getUserPlan(session.id);

    return successResult(userPlan);
  } catch {
    return errorResult('Failed to fetch user plan data');
  }
}
