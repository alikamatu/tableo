import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/menu',
  '/auth/google/callback', // Google OAuth landing — bootstraps session client-side
];
const AUTH_ROUTES = ['/login', '/register'];
const OWNER_DASHBOARD = '/dashboard';
const MGR_DASHBOARD = '/manager-dashboard';
const ONBOARDING = '/onboarding';

function redirectWithPreservedAuthParam(request: NextRequest, targetPath: string) {
  const target = new URL(targetPath, request.url);
  const authenticated = request.nextUrl.searchParams.get('authenticated');
  if (authenticated === 'true') {
    target.searchParams.set('authenticated', 'true');
  }
  return NextResponse.redirect(target);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass Next.js internals + static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.'))
    return NextResponse.next();

  const isPublic = PUBLIC_ROUTES.some((r) =>
    r === '/' ? pathname === '/' : pathname.startsWith(r),
  );
  if (isPublic) return NextResponse.next();

  // has_session is a lightweight cookie written by the frontend JS (markSession())
  // on the Vercel domain. The httpOnly refresh_token lives on the API domain and
  // is invisible here — this cookie is the middleware's only way to know about auth.
  const hasSession = !!request.cookies.get('has_session')?.value;

  // Unauthenticated → login
  if (!hasSession) {
    const url = new URL('/login', request.url);
    if (pathname !== '/') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Routing-hint cookies (non-sensitive flags) written by setSessionCookies()
  // after a successful login / initAuth. Default to safe values if not yet set.
  const onboardComplete = request.cookies.get('onboard_complete')?.value !== 'false';
  const staffRole = request.cookies.get('staff_role')?.value || undefined;
  const isStaff = !!staffRole;

  // ── Auth-only pages (login / register) ────────────────────────────────────
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    // Redirect to the right home for their role
    const home = isStaff ? MGR_DASHBOARD : OWNER_DASHBOARD;
    return redirectWithPreservedAuthParam(request, home);
  }

  // ── Owner flow ────────────────────────────────────────────────────────────
  if (!isStaff) {
    // Not onboarded → push to onboarding (except onboarding itself)
    if (!onboardComplete && !pathname.startsWith(ONBOARDING))
      return redirectWithPreservedAuthParam(request, ONBOARDING);

    // Onboarded + hitting onboarding → push to dashboard
    if (onboardComplete && pathname.startsWith(ONBOARDING))
      return redirectWithPreservedAuthParam(request, OWNER_DASHBOARD);

    // Staff trying to access manager dashboard → push to owner dashboard
    if (pathname.startsWith(MGR_DASHBOARD))
      return redirectWithPreservedAuthParam(request, OWNER_DASHBOARD);

    return NextResponse.next();
  }

  // ── Staff flow ────────────────────────────────────────────────────────────
  // Staff members should never access the owner dashboard or onboarding
  if (pathname.startsWith(OWNER_DASHBOARD) || pathname.startsWith(ONBOARDING))
    return redirectWithPreservedAuthParam(request, MGR_DASHBOARD);

  // Cashier / kitchen trying to access manager-only pages
  if (staffRole !== 'manager' && pathname.startsWith(`${MGR_DASHBOARD}/staff`))
    return redirectWithPreservedAuthParam(request, MGR_DASHBOARD);

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
