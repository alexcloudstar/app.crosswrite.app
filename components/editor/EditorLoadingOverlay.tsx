'use client';

type EditorLoadingOverlayProps = {
  isLoading: boolean;
  loadingType: 'ai' | 'suggestions' | 'thumbnail' | 'saving' | null;
};

export const EditorLoadingOverlay = ({
  isLoading,
  loadingType,
}: EditorLoadingOverlayProps) => {
  const getLoadingMessage = () => {
    switch (loadingType) {
      case 'ai':
        return {
          title: 'AI is processing your content...',
          subtitle: 'Please wait while we improve your text',
        };
      case 'suggestions':
        return {
          title: 'Generating suggestions...',
          subtitle: 'Please wait while we analyze your content',
        };
      case 'thumbnail':
        return {
          title: 'Generating thumbnail...',
          subtitle: 'Please wait while we create your thumbnail',
        };
      case 'saving':
        return {
          title: 'Saving draft...',
          subtitle: 'Please wait while we save your content',
        };
      default:
        return {
          title: 'Processing...',
          subtitle: 'Please wait',
        };
    }
  };

  const loadingMessage = getLoadingMessage();

  if (!isLoading) return null;

  return (
    <div className='absolute inset-0 bg-base-300/50 backdrop-blur-sm z-50 flex items-center justify-center'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='loading loading-spinner loading-lg text-primary'></div>
        <p className='text-lg font-medium'>{loadingMessage.title}</p>
        <p className='text-sm text-base-content/70'>
          {loadingMessage.subtitle}
        </p>
      </div>
    </div>
  );
};
