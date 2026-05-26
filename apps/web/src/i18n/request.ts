import { Language } from '@brickcatalog/database';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { getNestedMessages } from './messages';
import { routing } from './routing';

function toLocale(value: unknown): Language | null {
  if (typeof value !== 'string') {
    return null;
  }

  return hasLocale(routing.locales, value) ? value as Language : null;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const localeFromRequest = toLocale(await requestLocale);
  const locale = localeFromRequest ?? routing.defaultLocale;

  return {
    locale,
    messages: await getNestedMessages(locale),
  };
});
