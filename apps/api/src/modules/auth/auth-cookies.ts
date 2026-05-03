import type { Response as ExpressResponse } from 'express';

/**
 * Cookie options for auth tokens. Clearing cookies must use the same path/security flags.
 */
export function getCookieOptions(httpOnly = true) {
  const isProd = process.env['NODE_ENV'] === 'production';
  return {
    httpOnly,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function setAuthCookies(
  res: ExpressResponse,
  refreshToken: string,
  onboardComplete: boolean,
) {
  res.cookie('refresh_token', refreshToken, getCookieOptions(true));
  res.cookie('onboard_complete', String(onboardComplete), getCookieOptions(false));
}

export function clearAuthCookies(res: ExpressResponse) {
  const refreshOpts = getCookieOptions(true);
  const onboardOpts = getCookieOptions(false);
  const { maxAge: _1, ...refreshClear } = refreshOpts;
  const { maxAge: _2, ...onboardClear } = onboardOpts;
  res.clearCookie('refresh_token', refreshClear);
  res.clearCookie('onboard_complete', onboardClear);
}
