import { db } from '@/lib/prisma';

import { applyElementsCache } from './shared';

export interface YearlyTotal {
  year: number,
  total: number,
}

interface YearlyTotalRow {
  year: number,
  total: bigint,
}

/**
 * Get yearly element totals from Element.createdAt (ascending order for charts)
 */
export async function getYearlyElements(): Promise<YearlyTotal[]> {
  'use cache';

  applyElementsCache('annual');

  const rows = await db.$queryRaw<YearlyTotalRow[]>`
    SELECT
      EXTRACT(YEAR FROM "createdAt")::int AS year,
      COUNT(*)::bigint AS total
    FROM "Element"
    GROUP BY year
    ORDER BY year ASC
  `;

  return rows.map((row) => ({
    year: row.year,
    total: Number(row.total),
  }));
}
