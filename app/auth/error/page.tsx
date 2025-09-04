import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 via-base-200 to-base-300 p-4 relative overflow-hidden'>
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-error/10 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-warning/10 rounded-full blur-3xl'></div>
      </div>

      <div className='card w-full max-w-md bg-base-100/95 backdrop-blur-sm shadow-2xl border border-base-300/50 relative z-10'>
        <div className='card-body p-8 text-center'>
          <div className='mb-6'>
            <div className='avatar placeholder'>
              <div className='bg-error/20 text-error rounded-full w-20 h-20 shadow-lg'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-10 h-10'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-base-content mb-3'>
              Authentication Error
            </h1>
            <p className='text-base-content/70 text-sm leading-relaxed'>
              Something went wrong during the authentication process. This could
              be due to an expired link, invalid credentials, or a temporary
              server issue.
            </p>
          </div>

          <div className='space-y-4'>
            <Link
              href='/auth/sign-in'
              className='btn btn-primary w-full hover:shadow-lg transition-all duration-200'
            >
              Try Again
            </Link>

            <Link
              href='/'
              className='btn btn-outline w-full hover:shadow-lg transition-all duration-200'
            >
              Back to Home
            </Link>
          </div>

          <div className='mt-6 pt-4 border-t border-base-300/50'>
            <p className='text-xs text-base-content/60'>
              Still having trouble?{' '}
              <Link href='/support' className='link link-primary link-hover'>
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
