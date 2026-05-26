import type { Language } from '@brickcatalog/database';

const OVERVIEW_LOCALES: Record<Language, string> = {
  de: 'de-DE',
  en: 'en-US',
  nl: 'nl-NL',
};

export function getOverviewLocale(language: Language): string {
  return OVERVIEW_LOCALES[language] ?? OVERVIEW_LOCALES.en;
}

export function formatMonthLabel(month: string, language: Language): string {
  const [yearPart, monthPart] = month.split('-');
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return month;
  }

  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleString(getOverviewLocale(language), {
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  });
}
