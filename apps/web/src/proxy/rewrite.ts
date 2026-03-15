import type { ProxyHandler } from './types';

import { NextResponse } from 'next/server';

export const rewriteProxy: ProxyHandler = (request, next, context) => {
  // skip robots.txt, because next.js requires the corresponding robots.ts in the root directory
  if (request.nextUrl.pathname === '/robots.txt') {
    return next(request);
  }

  // prepend the internal url with the subdomain
  const internalUrl = request.nextUrl.clone();
  internalUrl.pathname = `/${context.subdomain ?? 'www'}${internalUrl.pathname}`;

  return NextResponse.rewrite(internalUrl, { request });
};
