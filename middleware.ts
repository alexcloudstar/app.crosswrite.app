export { auth as middleware } from '@/auth';

export const config = {
  matcher: ['/((?!api/auth|auth|_next|static|favicon.ico).*)'],
};
