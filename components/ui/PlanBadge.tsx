import { PlanId, getPlanDisplayName, getPlanColor } from '@/lib/plans';

type PlanBadgeProps = {
  planId: PlanId;
  className?: string;
};

export function PlanBadge({ planId, className = '' }: PlanBadgeProps) {
  const displayName = getPlanDisplayName(planId);
  const colorClass = getPlanColor(planId);

  return (
    <span className={`badge ${colorClass} ${className}`}>{displayName}</span>
  );
}
