'use client';

type DeploymentModeBadgeProps = {
  mode: 'HOSTED' | 'SELF_HOST';
  hasRequiredKey: boolean;
};

export function DeploymentModeBadge({
  mode,
  hasRequiredKey,
}: DeploymentModeBadgeProps) {
  if (mode === 'HOSTED') {
    return (
      <div className='flex items-center space-x-2'>
        <div className='badge badge-info badge-sm'>HOSTED</div>
        {hasRequiredKey ? (
          <span className='text-sm text-success'>
            Powered by Cross Write key
          </span>
        ) : (
          <span className='text-sm text-error'>Missing server app key</span>
        )}
      </div>
    );
  }

  return (
    <div className='flex items-center space-x-2'>
      <div className='badge badge-secondary badge-sm'>SELF_HOST</div>
      {hasRequiredKey ? (
        <span className='text-sm text-success'>Using instance .env key</span>
      ) : (
        <span className='text-sm text-error'>
          Set OPENAI_API_KEY in environment
        </span>
      )}
    </div>
  );
}
