import type { ProxyHandler } from './proxy/types';
import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { contentSecurityPolicyProxy } from './proxy/content-security-policy';
import { corsProxy } from './proxy/cors';
import { healthProxy } from './proxy/health';
import { languageProxy } from './proxy/language';
import { logProxy } from './proxy/log';
import { realUrlProxy } from './proxy/real-url';
import { rewriteProxy } from './proxy/rewrite';
import { subdomainProxy } from './proxy/subdomain';

export async function proxy(request: NextRequest) {
  const proxies: ProxyHandler[] = [
    logProxy,
    healthProxy,
    realUrlProxy,
    subdomainProxy,
    corsProxy,
    contentSecurityPolicyProxy,
    languageProxy,
    rewriteProxy,
  ];

  const context = {};

  let index = 0;
  const next = async (request: NextRequest) => {
    if (index < proxies.length) {
      return await proxies[index++](request, next, context);
    }

    return NextResponse.next({ request });
  };

  const response = await next(request);

  return response;
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|android-chrome-[^/]+.png|apple-touch-icon.png|browserconfig.xml|favicon-[^/]+.png|mstile-[^/]+.png|safari-pinned-tab.svg|maskable_icon_[^/]+.png).*)',
};
