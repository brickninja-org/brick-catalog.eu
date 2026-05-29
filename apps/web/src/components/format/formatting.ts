import { Language } from '@brickcatalog/database';

export type FormatOption = {
  key: string,
  label: string,
};

type AvailableLocales = {
  languages: string[],
  regions: string[],
};

export const SUPPORTED_LANGUAGES = [
  'de',
  'en',
  'nl',
] as const satisfies readonly Language[];

const DEFAULT_LOCALES: AvailableLocales = {
  languages: [...SUPPORTED_LANGUAGES],
  regions: ['US', 'GB', 'DE', 'NL'],
};

const LOCALE_REGEX = /^([a-z]{2,4})(?:[_-][a-z]{4})?[_-]([a-z]{2,3})\b/i;

export function isSupportedLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

function safeDisplayName(
  displayNames: Intl.DisplayNames,
  code: string,
): string {
  try {
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export function getAvailableLocales(): AvailableLocales {
  if (typeof window === 'undefined') {
    return {
      languages: [...DEFAULT_LOCALES.languages],
      regions: [...DEFAULT_LOCALES.regions],
    };
  }

  return navigator.languages.reduceRight<AvailableLocales>((available, lang) => {
    const match = lang.match(LOCALE_REGEX);

    if (!match) return available;

    const language = match[1].toLowerCase();
    const region = match[2]?.toUpperCase();

    if (region) {
      return {
        languages: [
          language,
          ...available.languages.filter((value) => value !== language),
        ],
        regions: [
          region,
          ...available.regions.filter((value) => value !== region),
        ],
      };
    }

    return {
      ...available,
      languages: [
        language,
        ...available.languages.filter((value) => value !== language),
      ],
    };
  }, {
    languages: [...DEFAULT_LOCALES.languages],
    regions: [...DEFAULT_LOCALES.regions],
  });
}

export function getLanguageOptions(currentLanguage: string): FormatOption[] {
  const { languages } = getAvailableLocales();

  const displayNames = new Intl.DisplayNames([currentLanguage], {
    type: 'language',
    fallback: 'none',
  });

  return [
    {
      key: 'auto',
      label: `Current Language (${currentLanguage})`,
    },
    ...languages.map((code) => ({
      key: code,
      label: `${safeDisplayName(displayNames, code)} (${code})`,
    })),
  ];
}

export function getRegionOptions(currentLanguage: string, defaultRegion: string): FormatOption[] {
  const { regions } = getAvailableLocales();

  const displayNames = new Intl.DisplayNames([currentLanguage], {
    type: 'region',
    fallback: 'none',
  });

  return [
    {
      key: 'browser',
      label: `Browser Region (${defaultRegion})`,
    },
    ...regions.map((code) => ({
      key: code,
      label: `${safeDisplayName(displayNames, code)} (${code})`,
    }))];
}

export function formatDate(locale: string, date: Date): string {
  try {
    return Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export function getFormatPreview(locale: string) {
  return {
    locale,
    date: formatDate(locale, new Date()),
  };
}
