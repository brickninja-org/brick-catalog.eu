export const OVERVIEW_LOCALE = 'en-DE';

export function formatMonthLabel(month: string): string {
  const [yearPart, monthPart] = month.split('-');
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return month;
  }

  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleString(OVERVIEW_LOCALE, {
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  });
}
