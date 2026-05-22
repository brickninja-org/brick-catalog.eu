import { db } from '@/lib/prisma';

import { applyElementsCache, getMonthRange } from './shared';

interface MonthlyComparison {
  currentMonth: { total: number },
  previousMonth: { total: number },
}

interface MonthlyComparisonRow {
  currentMonthTotal: bigint,
  previousMonthTotal: bigint,
}

/**
 * Get element totals for the requested month and the previous month.
 */
export async function getElementsComparison(latestMonth: string): Promise<MonthlyComparison> {
  'use cache';

  applyElementsCache('monthly');
  const { from: currentFrom, to: currentTo } = getMonthRange(latestMonth);
  const previousFrom = new Date(Date.UTC(currentFrom.getUTCFullYear(), currentFrom.getUTCMonth() - 1, 1));

  const [row] = await db.$queryRaw<MonthlyComparisonRow[]>`
    SELECT
      COUNT(*) FILTER (WHERE "createdAt" >= ${currentFrom} AND "createdAt" < ${currentTo})::bigint AS "currentMonthTotal",
      COUNT(*) FILTER (WHERE "createdAt" >= ${previousFrom} AND "createdAt" < ${currentFrom})::bigint AS "previousMonthTotal"
    FROM "Element"
  `;

  return {
    currentMonth: { total: Number(row?.currentMonthTotal ?? 0n) },
    previousMonth: { total: Number(row?.previousMonthTotal ?? 0n) },
  };
}
