import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessible without authentication
const PUBLIC_ROUTES = ['/login', '/register', '/menu', '/', '/forgot-password', '/reset-password'];


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through static assets and Next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public menu pages — always accessible
  if (pathname.startsWith('/menu')) {
    return NextResponse.next();
  }

  /**
   * We can't verify the JWT in the Edge runtime without a crypto library,
   * but we CAN check for the presence of the httpOnly refresh token cookie.
   * The actual token validity is enforced by the API — this is just a routing guard.
   *
   * Cookie name must match what the NestJS auth controller sets:
   *   res.cookie('refresh_token', token, { httpOnly: true, sameSite: 'strict', ... })
   */
  const hasRefreshCookie = request.cookies.has('refresh_token');

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  // Logged-in user visiting login/register → send to dashboard
  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (hasRefreshCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated user visiting protected route → send to login
  if (!hasRefreshCookie && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js assets)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
