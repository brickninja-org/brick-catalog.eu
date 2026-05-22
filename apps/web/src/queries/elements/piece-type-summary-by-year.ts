import { db } from '@/lib/prisma';

import { applyElementsCache, getLatestElementCreatedAt, getYearRange } from './shared';

interface PieceTypeSummaryByYear {
  year: number,
  total: number,
  lego: number,
  duplo: number,
  technic: number,
}

interface PieceTypeSummaryByYearRow {
  total: bigint,
  lego: bigint,
  duplo: bigint,
  technic: bigint,
}

/**
 * Get element totals for the latest registration year, split by piece type.
 */
export async function getPieceTypeSummaryByYear(): Promise<PieceTypeSummaryByYear | null> {
  'use cache';

  applyElementsCache('annual', 'piece-types');

  const latestCreatedAt = await getLatestElementCreatedAt();
  const year = latestCreatedAt?.getUTCFullYear();

  if (year == null) {
    return null;
  }

  const { from: yearFrom, to: yearTo } = getYearRange(year);

  const [row] = await db.$queryRaw<PieceTypeSummaryByYearRow[]>`
    SELECT
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE d."pieceType" = 'LEGO')::bigint AS lego,
      COUNT(*) FILTER (WHERE d."pieceType" = 'DUPLO')::bigint AS duplo,
      COUNT(*) FILTER (WHERE d."pieceType" = 'TECHNIC')::bigint AS technic
    FROM "Element" e
    LEFT JOIN "Design" d ON d."id" = e."designId"
    WHERE e."createdAt" >= ${yearFrom} AND e."createdAt" < ${yearTo}
  `;

  return {
    year,
    total: Number(row?.total ?? 0n),
    lego: Number(row?.lego ?? 0n),
    duplo: Number(row?.duplo ?? 0n),
    technic: Number(row?.technic ?? 0n),
  };
}
