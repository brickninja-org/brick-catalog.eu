import 'server-only';

import type { RegeneratablePostDataType } from '@brickcatalog/ai';

import { tokeniser } from '@/lib/tokeniser';

export async function fetchDataForPostRegeneration(
  month: string,
  dataType: RegeneratablePostDataType,
): Promise<string> {
  console.log(`[REGENERATE] Fetching ${dataType} data for ${month}`);

  if (dataType === 'elements') {
    const { getElementsAggregatedByMonth } = await import(
      '@/queries/elements/latest-month'
    );

    const elements = await getElementsAggregatedByMonth(month);

    return tokeniser(elements);
  }

  const { getElementsLatestMonth } = await import(
    '@/queries/elements/latest-month'
  );

  const sets = await getElementsLatestMonth();

  return tokeniser(sets);
}
