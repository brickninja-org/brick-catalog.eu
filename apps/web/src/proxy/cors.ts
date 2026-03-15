import type { ProxyHandler } from './types';

import { Language } from '@brickcatalog/database';
import { NextResponse } from 'next/server';

import { getBaseUrl } from '@/lib/url';


const languages = Object.values(Language);
const validOrigins = languages.map((language) => getBaseUrl(language).origin);

export const corsProxy: ProxyHandler = async (request, next, context) => {
  // skip this proxy for API
  if (context.subdomain === 'api') {
    return next(request);
  }

  const origin = request.headers.get('Origin');

  // allow the request if the origin is not set (no CORS request)
  // or if it matches the baseDomain
  const isAllowed = !origin || validOrigins.includes(origin);
  if (!isAllowed) {
    console.error('Blocked CORS request.');

    return new NextResponse('', { status: 400 });
  }

  const response = await next(request);

  if (isAllowed && origin) {
    response.headers.append('Access-Control-Allow-Origin', origin);

    // `Vary: Origin` is required, because otherwise `Access-Control-Allow-Origin` is cached for wrong origins
    // nextjs currently doesn't support setting `Vary` in proxy (https://github.com/vercel/next.js/issues/48480)
    // so every relevant endpoint needs to set `Vary: Origin` on the response.
    response.headers.append('Vary', 'Origin');
  }

  return response;
};
