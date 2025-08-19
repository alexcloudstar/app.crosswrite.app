'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('google', { callbackUrl: '/' });
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('email', {
        email,
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.ok) {
        setIsEmailSent(true);
      }
    } catch (error) {
      console.error('Email sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-base-100'>
      <div className='card w-full max-w-md bg-base-200 shadow-xl'>
        <div className='card-body'>
          <div className='text-center mb-6'>
            <h1 className='text-3xl font-bold text-base-content'>
              Welcome to Cross Write
            </h1>
            <p className='text-base-content/70 mt-2'>
              Sign in to your account to continue
            </p>
          </div>

          {isEmailSent ? (
            <div className='alert alert-success'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='stroke-current shrink-0 h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <div>
                <h3 className='font-bold'>Check your email!</h3>
                <div className='text-xs'>
                  We&apos;ve sent a magic link to{' '}
                  <span className='font-semibold'>{email}</span>. Click the link
                  in your email to sign in.
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <form onSubmit={handleGoogleSignIn}>
                <button type='submit' className='btn btn-outline w-full'>
                  <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                    <path
                      fill='#4285F4'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='#34A853'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='#FBBC05'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='#EA4335'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                  Sign in with Google
                </button>
              </form>

              <div className='divider'>OR</div>

              <form onSubmit={handleEmailSignIn} className='space-y-3'>
                <div className='form-control'>
                  <label htmlFor='email' className='label'>
                    <span className='label-text'>Email address</span>
                  </label>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className='input input-bordered w-full'
                    placeholder='Enter your email'
                  />
                </div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='btn btn-primary w-full'
                >
                  {isLoading ? (
                    <>
                      <span className='loading loading-spinner loading-sm'></span>
                      Sending...
                    </>
                  ) : (
                    'Send magic link'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
