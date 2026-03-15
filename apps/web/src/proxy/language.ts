import type { ProxyHandler } from './types';

import { Language } from '@brickcatalog/database';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME } from '@/lib/auth/cookie';
import { createRememberLanguageCookie, rememberLanguageCookieName } from '@/lib/cookie';
import { getBaseUrl } from '@/lib/url';

export const languageProxy: ProxyHandler = async (request, next, context) => {
  const url = context.url;
  const subdomain = context.subdomain;

  if (!url) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  // get remembered language from cookie
  const rememberedLanguage = getLanguageFromCookie(request);

  // handle language not found
  if (!subdomain) {
    // if no language was detected we need to redirect to the correct domain
    const language = rememberedLanguage ?? getLanguageFromAcceptLanguage(request);

    url.hostname = getBaseUrl(language).hostname;

    // if we attempted to do this already, show error
    if(request.cookies.has('redirect_loop')) {
      return new NextResponse(`Could not redirect to ${url.toString()}.`, { status: 500 });
    }

    console.log(`> Redirecting to ${url}`);

    // create redirect
    const redirect = NextResponse.redirect(url);

    // set cookie to detect redirect loops
    redirect.cookies.set('redirect_loop', '1', { maxAge: 10 });

    // return redirect
    return redirect;
  }

  if(subdomain === 'api') {
    // handle api requests
    // set language based on `lang` search param, fallback to en
    const lang = request.nextUrl.searchParams.get('lang');
    const isValidLang = lang && lang in Language;

    request.headers.set('x-bc-lang', isValidLang ? lang : 'en');
  } else {
    // handle normal language subdomains
    request.headers.set('x-bc-lang', subdomain);
  }

  const response = await next(request);

  // if the user is logged in they have accepted cookies, so we can store the current language as a cookie
  const userHasAcceptedCookies = request.cookies.has(SESSION_COOKIE_NAME) || rememberedLanguage;
  if(subdomain !== 'api' && userHasAcceptedCookies && rememberedLanguage !== subdomain) {
    response.cookies.set(createRememberLanguageCookie(subdomain));
  }

  return response;
};

function getLanguageFromCookie(request: NextRequest): Language | undefined {
  const language = request.cookies.get(rememberLanguageCookieName);

  if(language?.value && language.value in Language) {
    return language.value as Language;
  }

  return undefined;
}

function getLanguageFromAcceptLanguage(request: NextRequest): Language {
  const acceptLanguage = new Negotiator({ headers: Object.fromEntries(request.headers.entries()) }).languages();

  const language = acceptLanguage.length === 1 && acceptLanguage[0] === '*'
    ? Language.en
    : match(acceptLanguage, Object.values(Language), Language.en) as Language;

  return language;
}
