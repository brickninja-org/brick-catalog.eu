import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

import { getBaseUrl } from '@/lib/url';

/** Name of session cookie */
export const SESSION_COOKIE_NAME = 'bc-session';

/** Seconds until auth session expires */
export const expiresIn = 365 * 24 * 60 * 60; // 1 year

/** Base auth cookie settings */
export const authCookieSettings: Omit<ResponseCookie, 'value' | 'expires'> = {
  name: SESSION_COOKIE_NAME,

  domain: '.' + getBaseUrl().hostname,
  sameSite: 'lax',
  httpOnly: true,
  priority: 'high',
  path: '/',

  // always set to secure
  // `localhost` is considered a secure origin so this works even in dev
  secure: true,
};

/** Create auth cookie with session id and expiration timestamp */
export function authCookie(sessionId: string, expiresAt: Date): ResponseCookie {
  return {
    ...authCookieSettings,

    value: sessionId,
    expires: expiresAt
  };
}
