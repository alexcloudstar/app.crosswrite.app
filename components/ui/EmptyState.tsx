import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {icon && (
        <div className='w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4'>
          <div className='text-base-content/50 text-2xl'>{icon}</div>
        </div>
      )}
      <h3 className='text-lg font-semibold mb-2'>{title}</h3>
      <p className='text-base-content/70 mb-6 max-w-md'>{description}</p>
      {action && action}
    </div>
  );
}
