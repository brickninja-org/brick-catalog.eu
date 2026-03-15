import type { ProxyHandler } from './types';

import { NextResponse } from 'next/server';

export const healthProxy: ProxyHandler = (request, next) => {
  if (request.nextUrl.pathname === '/_/health') {
    return new NextResponse('UP');
  }

  return next(request);
};
