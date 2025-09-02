import { useAppStore } from '@/lib/store';
import { TrendingUp, Image as ImageIcon } from 'lucide-react';

interface QuotaHintProps {
  type: 'articles' | 'thumbnails';
  className?: string;
}

export function QuotaHint({ type, className = '' }: QuotaHintProps) {
  const { getUsageStatus } = useAppStore();
  const usage = getUsageStatus();
  const data = usage[type];

  const icon =
    type === 'articles' ? <TrendingUp size={14} /> : <ImageIcon size={14} />;
  const label = type === 'articles' ? 'Articles' : 'Thumbnails';

  const isUnlimited = data.limit === 'UNLIMITED';
  const percentage = isUnlimited
    ? 0
    : (data.used / (data.limit as number)) * 100;
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 100;

  if (isUnlimited) {
    return (
      <div
        className={`flex items-center space-x-1 text-sm text-base-content/50 ${className}`}
      >
        {icon}
        <span>{label}: Unlimited</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 text-sm ${className}`}>
      {icon}
      <span
        className={
          isAtLimit
            ? 'text-error'
            : isNearLimit
              ? 'text-warning'
              : 'text-base-content/50'
        }
      >
        {label}: {data.used}/{data.limit}
      </span>
      {isNearLimit && (
        <div className='w-2 h-2 rounded-full bg-warning animate-pulse'></div>
      )}
    </div>
  );
}
