import Link from 'next/link';

interface Integration {
  id: string;
  platform: string;
  status: string;
  publicationId?: string;
}

interface IntegrationWarningProps {
  integrations: Integration[];
}

export function IntegrationWarning({ integrations }: IntegrationWarningProps) {
  const integrationsNeedingPublicationIds = integrations.filter(
    integration =>
      integration.status === 'connected' &&
      integration.platform === 'hashnode' &&
      !integration.publicationId
  );

  if (integrationsNeedingPublicationIds.length === 0) {
    return null;
  }

  return (
    <div className='alert alert-warning mb-6'>
      <div>
        <h3 className='font-bold'>Integration Setup Required</h3>
        <div className='text-sm'>
          Some of your integrations need publication IDs to publish content:
          {integrationsNeedingPublicationIds.map(integration => (
            <div key={integration.id} className='mt-1'>
              •{' '}
              {integration.platform.charAt(0).toUpperCase() +
                integration.platform.slice(1)}
              : Missing publication ID
            </div>
          ))}
          <div className='mt-2'>
            <p>To fix this:</p>
            <ol className='list-decimal list-inside mt-1 space-y-1'>
              <li>
                Go to the{' '}
                <Link href='/integrations' className='link link-primary'>
                  Integrations page
                </Link>
              </li>
              <li>Click &quot;Select Publication&quot; for each platform</li>
              <li>Choose your publication from the list</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
