import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
};

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'card bg-base-100 border border-base-300 shadow-sm',
        className
      )}
    >
      <div className='card-body p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <div className='flex items-center space-x-2 mb-2'>
              {icon && <div className='text-base-content/50'>{icon}</div>}
              <h3 className='text-sm font-medium text-base-content/70'>
                {title}
              </h3>
            </div>
            <div className='flex items-baseline space-x-2'>
              <p className='text-2xl font-bold'>{value}</p>
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive ? 'text-success' : 'text-error'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className='text-sm text-base-content/50 mt-1'>{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
