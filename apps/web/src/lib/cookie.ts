import type { Language } from '@brickcatalog/database';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

import { expiresAtFromExpiresIn } from './expires-at-from-expires-in';

export const REMEMBER_LANGUAGE_COOKIE_NAME = 'bc-lang';

export function createRememberLanguageCookie(language: Language) {
  const baseDomain = new URL(process.env.BC_URL || document.documentElement.dataset.baseUrl!).hostname;

  return {
    name: REMEMBER_LANGUAGE_COOKIE_NAME,
    value: language,
    domain: baseDomain,
    path: '/',
    expires: expiresAtFromExpiresIn(365 * 24 * 60 * 60),
    httpOnly: false,
    sameSite: 'lax',
    secure: true,
  } satisfies ResponseCookie;
}
