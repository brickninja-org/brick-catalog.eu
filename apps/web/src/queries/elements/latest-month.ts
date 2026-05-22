import { applyElementsCache, formatYearMonth, getLatestElementCreatedAt } from './shared';

/**
 * Get the latest month with element createdAt data
 */
export async function getElementsLatestMonth(): Promise<string | null> {
  'use cache';

  applyElementsCache('monthly');

  const latestCreatedAt = await getLatestElementCreatedAt();

  if (!latestCreatedAt) {
    return null;
  }

  return formatYearMonth(latestCreatedAt);
}
