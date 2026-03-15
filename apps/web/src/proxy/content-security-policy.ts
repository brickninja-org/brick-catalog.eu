import type { ProxyHandler } from './types';

import { Language } from '@brickcatalog/database';

import { getBaseUrl } from '@/lib/url';

const languageSubdomains = [...Object.values(Language)];

export const contentSecurityPolicyProxy: ProxyHandler = async (request, next, context) => {
  const subdomain = context.subdomain;

  // skip CSP for api.brick-catalog.eu
  if (subdomain === 'api') {
    return next(request);
  }

  // generate nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // generate list of alternate language hosts
  const alternateLanguageHosts = languageSubdomains
    .filter((language) => language !== subdomain)
    .map((language) => getBaseUrl(language).host);

  // construct CSP header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${process.env.NODE_ENV !== 'production' ? '\'unsafe-eval\'' : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self';
    connect-src 'self' ${alternateLanguageHosts.join(' ')} brick.ninja;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ');

  // set x-nonce and CSP for internal requests
  request.headers.set('X-Nonce', nonce);
  request.headers.set('Content-Security-Policy', cspHeader);

  // get response
  const response = await next(request);

  // set outgoing CSP
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
};
