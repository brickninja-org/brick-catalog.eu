export function resolveLocale(
  language: string | 'auto',
  region: string | 'browser',
  currentLanguage: string,
  defaultLocale: string,
  defaultRegion: string,
): string {
  const resolvedLanguage = language === 'auto' ? currentLanguage : language;
  const resolvedRegion = region === 'browser' ? defaultRegion : region;

  const [supported] = Intl.DateTimeFormat.supportedLocalesOf([
    `${resolvedLanguage}-${resolvedRegion}`,
    resolvedLanguage,
    defaultLocale,
    'en-US',
  ]);

  return supported ?? 'en-US';
}
