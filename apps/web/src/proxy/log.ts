import type { ProxyHandler } from './types';

declare module './types' {
  interface ProxyContext {
    requestId: string,
  }
}

export const logProxy: ProxyHandler = async (request, next, context) => {
  const requestId = crypto.randomUUID();
  context.requestId = requestId;

  const ip = request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for');

  console.log(`> [${requestId}] ${request.method} ${request.nextUrl.pathname}${request.nextUrl.search}${ip ? ` (${ip})` : ''}`);

  const response = await next(request);

  // console.log('<', requestId, Object.fromEntries(response.headers.entries()));
  response.headers.append('x-request-id', requestId);

  return response;
};
