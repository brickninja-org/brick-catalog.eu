import type { Language } from '@brickcatalog/database';

const baseUrl: undefined | Readonly<URL> = process.env.BC_URL ? new URL(process.env.BC_URL) : undefined;

export function getBaseUrl(subdomain?: Language | 'api'): Readonly<URL> {
  if (!baseUrl) {
    throw new Error('Missing required environment variable `BC_URL`');
  }

  if (!subdomain) {
    return baseUrl;
  }

  const urlWithSubdomain = new URL(baseUrl);
  urlWithSubdomain.hostname = `${subdomain}.${urlWithSubdomain.hostname}`;

  return urlWithSubdomain;
}

export function getUrlFromRequest(request: Request) {
  const url = new URL(request.url);
  url.host = request.headers.get('Host')?.split(':')[0] ?? url.host;
  url.port = request.headers.get('X-Forwarded-Port')?.split(',')[0] ?? url.port;
  url.protocol = request.headers.get('X-Forwarded-Proto')?.split(',')[0].concat(':') ?? url.protocol;

  return url;
}
