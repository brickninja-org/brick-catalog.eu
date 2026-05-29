import { Language } from '@brickcatalog/database';
import { defineRouting } from 'next-intl/routing';

const baseHost = process.env.BC_URL
  ? new URL(process.env.BC_URL).hostname
  : process.env.NODE_ENV === 'development'
    ? 'brickcatalog.localhost'
    : 'brick-catalog.eu';

export const routing = defineRouting({
  locales: Object.values(Language),
  defaultLocale: Language.en,
  localePrefix: 'never',
  domains: [
    {
      domain: `en.${baseHost}`,
      defaultLocale: Language.en,
      locales: [Language.en],
    },
    {
      domain: `nl.${baseHost}`,
      defaultLocale: Language.nl,
      locales: [Language.nl],
    },
    {
      domain: `de.${baseHost}`,
      defaultLocale: Language.de,
      locales: [Language.de],
    },
  ],
  localeDetection: false,
});
