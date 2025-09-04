import {
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Settings,
  XCircle,
} from 'lucide-react';

type Platform = {
  platform: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  url: string;
  status: string;
  id?: string;
  connectedAt?: Date;
  lastSync?: Date;
};

type PlatformCardProps = {
  platform: Platform;
  connecting: string | null;
  testing: string | null;
  selectedPublicationName: string;
  onConnect: (platform: string) => void;
  onDisconnect: (platform: string) => void;
  onShowSettings: (platform: string) => void;
  onTestConnection: (platform: string) => void;
  onLoadPublications: (platform: string) => void;
};

export function PlatformCard({
  platform,
  connecting,
  testing,
  selectedPublicationName,
  onConnect,
  onDisconnect,
  onShowSettings,
  onTestConnection,
  onLoadPublications,
}: PlatformCardProps) {
  const onConnectHandler = () => onConnect(platform.platform);
  const onDisconnectHandler = () => onDisconnect(platform.platform);
  const onShowSettingsHandler = () => onShowSettings(platform.platform);
  const onTestConnectionHandler = () => onTestConnection(platform.platform);
  const onLoadPublicationsHandler = () => onLoadPublications(platform.platform);

  return (
    <div className='card bg-base-100 border border-base-300 shadow-sm'>
      <div className='card-body'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <div
              className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold`}
            >
              {platform.icon}
            </div>
            <div>
              <h3 className='font-semibold'>{platform.name}</h3>
              <p className='text-sm text-base-content/50'>
                {platform.description}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-1 text-success'>
            {platform.status === 'connected' ? (
              <>
                <CheckCircle size={16} />
                <span className='text-sm'>Connected</span>
              </>
            ) : (
              <>
                <XCircle size={16} />
                <span className='text-sm'>Not Connected</span>
              </>
            )}
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <a
              href={platform.url}
              target='_blank'
              rel='noopener noreferrer'
              className='btn btn-ghost btn-sm'
            >
              <ExternalLink size={16} className='mr-1' />
              Visit
            </a>
            {platform.status === 'connected' && (
              <>
                <button
                  onClick={onShowSettingsHandler}
                  className='btn btn-ghost btn-sm'
                >
                  <Settings size={16} className='mr-1' />
                  Settings
                </button>
                <button
                  onClick={onTestConnectionHandler}
                  disabled={testing === platform.platform}
                  className='btn btn-ghost btn-sm'
                  title='Test Connection'
                >
                  {testing === platform.platform ? (
                    <div className='loading loading-spinner loading-xs'></div>
                  ) : (
                    <RefreshCw size={16} />
                  )}
                </button>
              </>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            {platform.status === 'connected' ? (
              <button
                onClick={onDisconnectHandler}
                disabled={connecting === platform.platform}
                className='btn btn-outline btn-sm'
              >
                {connecting === platform.platform ? (
                  <>
                    <div className='loading loading-spinner loading-xs'></div>
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </button>
            ) : (
              <button
                onClick={onConnectHandler}
                disabled={connecting === platform.platform}
                className='btn btn-primary btn-sm'
              >
                {connecting === platform.platform ? (
                  <>
                    <div className='loading loading-spinner loading-xs'></div>
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </button>
            )}
          </div>
        </div>

        {platform.status === 'connected' && platform.lastSync && (
          <div className='mt-3 pt-3 border-t border-base-300'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-base-content/50'>Last synced</span>
              <span>{platform.lastSync.toLocaleDateString()}</span>
            </div>
            {platform.platform === 'hashnode' && (
              <div className='flex items-center space-x-2 mt-2'>
                {selectedPublicationName && (
                  <span className='text-xs text-base-content/70'>
                    Selected: {selectedPublicationName}
                  </span>
                )}
                <button
                  onClick={onLoadPublicationsHandler}
                  className={`btn btn-xs ${
                    selectedPublicationName ? 'btn-success' : 'btn-ghost'
                  }`}
                >
                  {selectedPublicationName
                    ? 'Change Publication'
                    : 'Select Publication'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
