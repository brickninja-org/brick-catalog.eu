import type { ProxyHandler } from './types';

import { NextResponse } from 'next/server';

export const rewriteProxy: ProxyHandler = (request, next, context) => {
  const { subdomain } = context;
  const pathname = request.nextUrl.pathname;

  // Keep workflow callbacks on their native root endpoint.
  if (pathname.startsWith('/.well-known/workflow/')) {
    return next(request);
  }

  // skip robots.txt, because next.js requires the corresponding robots.ts in the root directory
  if (pathname === '/robots.txt') {
    return next(request);
  }

  // prepend the internal url with the subdomain
  const internalUrl = request.nextUrl.clone();
  internalUrl.pathname = `/${subdomain ?? 'www'}${pathname}`;

  return NextResponse.rewrite(internalUrl, { request });
};
