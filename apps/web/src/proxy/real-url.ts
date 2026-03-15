import type { ProxyHandler } from './types';

import { getUrlFromRequest } from '@/lib/url';

declare module './types' {
  interface ProxyContext {
    url: URL,
  }
}

export const realUrlProxy: ProxyHandler = (request, next, context) => {
  // get original url before any proxies from request
  const url = getUrlFromRequest(request);

  // append url to proxy context and request
  context.url = url;
  request.headers.append('x-bc-real-url', url.toString());

  return next(request);
};
