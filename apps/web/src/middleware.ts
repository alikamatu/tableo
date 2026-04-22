import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES   = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/menu'];
const AUTH_ROUTES     = ['/login', '/register'];
const OWNER_DASHBOARD = '/restaurants';
const MGR_DASHBOARD   = '/manager-dashboard';
const ONBOARDING      = '/onboarding';

/** Decode JWT payload without verifying (Edge runtime only — no crypto libs) */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(json.split('').map((c) =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2),
    ).join('')));
  } catch { return null; }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass Next.js internals + static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.'))
    return NextResponse.next();

  const isPublic = PUBLIC_ROUTES.some((r) => r === '/' ? pathname === '/' : pathname.startsWith(r));
  if (isPublic) return NextResponse.next();

  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasSession   = !!refreshToken;

  // Unauthenticated → login
  if (!hasSession) {
    const url = new URL('/login', request.url);
    if (pathname !== '/') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Decode the refresh token to read role flags
  // (We use the refresh token because it lives in cookies; access token is memory-only)
  const payload = decodeJwtPayload(refreshToken);
  const onboardComplete = (payload?.onboardComplete as boolean) ?? true;
  const isStaff         = !!(payload?.staffRole);
  const staffRole       = payload?.staffRole as string | undefined;

  // ── Auth-only pages (login / register) ────────────────────────────────────
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    // Redirect to the right home for their role
    const home = isStaff ? MGR_DASHBOARD : OWNER_DASHBOARD;
    return NextResponse.redirect(new URL(home, request.url));
  }

  // ── Owner flow ────────────────────────────────────────────────────────────
  if (!isStaff) {
    // Not onboarded → push to onboarding (except onboarding itself)
    if (!onboardComplete && !pathname.startsWith(ONBOARDING))
      return NextResponse.redirect(new URL(ONBOARDING, request.url));

    // Onboarded + hitting onboarding → push to dashboard
    if (onboardComplete && pathname.startsWith(ONBOARDING))
      return NextResponse.redirect(new URL(OWNER_DASHBOARD, request.url));

    // Staff trying to access manager dashboard → push to owner dashboard
    if (pathname.startsWith(MGR_DASHBOARD))
      return NextResponse.redirect(new URL(OWNER_DASHBOARD, request.url));

    return NextResponse.next();
  }

  // ── Staff flow ────────────────────────────────────────────────────────────
  // Staff members should never access the owner dashboard or onboarding
  if (pathname.startsWith(OWNER_DASHBOARD) || pathname.startsWith(ONBOARDING))
    return NextResponse.redirect(new URL(MGR_DASHBOARD, request.url));

  // Cashier / kitchen trying to access manager-only pages
  if (staffRole !== 'manager' && pathname.startsWith(`${MGR_DASHBOARD}/staff`))
    return NextResponse.redirect(new URL(MGR_DASHBOARD, request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
