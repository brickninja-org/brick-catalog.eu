import type { ProxyHandler } from './types';

import { Language } from '@brickcatalog/database';
import { NextResponse } from 'next/server';

import { getBaseUrl } from '@/lib/url';


declare module './types' {
  interface ProxyContext {
    subdomain: Subdomain,
  }
}

type Subdomain = Language | 'api';

const validSubdomains: Subdomain[] = ['api', ...Object.values(Language)];

export const subdomainProxy: ProxyHandler = (request, next, context) => {
  const url = context.url;
  if (!url) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  // find the subdomain by parsing the hostname
  const subdomain = validSubdomains.find((subdomain) => url.hostname === getBaseUrl(subdomain).hostname);
  context.subdomain = subdomain;

  return next(request);
};
