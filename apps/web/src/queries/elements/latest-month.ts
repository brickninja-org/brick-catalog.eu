import { db } from '@/lib/prisma';

import {
  applyElementsCache,
  formatYearMonth,
  getLatestElementCreatedAt,
  getMonthRange,
} from './shared';

export interface ElementsAggregatedByMonth {
  month: string,
  total: number,
  lego: number,
  duplo: number,
  technic: number,
}

interface ElementsAggregatedByMonthRow {
  total: bigint,
  lego: bigint,
  duplo: bigint,
  technic: bigint,
}

/**
 */
export async function getElementsAggregatedByMonth(month: string): Promise<ElementsAggregatedByMonth> {
  const { from: monthFrom, to: monthTo } = getMonthRange(month);
  const [row] = await db.$queryRaw<ElementsAggregatedByMonthRow[]>`
    SELECT
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE d."pieceType" = 'LEGO')::bigint AS lego,
      COUNT(*) FILTER (WHERE d."pieceType" = 'DUPLO')::bigint AS duplo,
      COUNT(*) FILTER (WHERE d."pieceType" = 'TECHNIC')::bigint AS technic
    FROM "Element" e
    LEFT JOIN "Design" d ON d."id" = e."designId"
    WHERE e."createdAt" >= ${monthFrom} AND e."createdAt" < ${monthTo}
  `;

  return {
    month,
    total: Number(row?.total ?? 0n),
    lego: Number(row?.lego ?? 0n),
    duplo: Number(row?.duplo ?? 0n),
    technic: Number(row?.technic ?? 0n),
  };
}

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
