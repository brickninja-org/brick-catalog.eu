import type { MonthlyComparison } from '@/queries/elements/monthly-comparison';
import type { PieceTypeSummaryByYear } from '@/queries/elements/piece-type-summary-by-year';
import type { YearlyTotal } from '@/queries/elements/yearly-statistics';

import { getElementsLatestMonth } from '@/queries/elements/latest-month';
import { getElementsComparison } from '@/queries/elements/monthly-comparison';
import { getPieceTypeSummaryByYear } from '@/queries/elements/piece-type-summary-by-year';
import { getYearlyElements } from '@/queries/elements/yearly-statistics';

export interface OverviewData {
  yearlyData: YearlyTotal[],
  pieceTypeSummary: PieceTypeSummaryByYear | null,
  latestMonth: string | null,
  monthlyComparison: MonthlyComparison | null,
}

export async function getOverviewData(): Promise<OverviewData> {
  const [yearlyData, pieceTypeSummary, latestMonth] = await Promise.all([
    getYearlyElements(),
    getPieceTypeSummaryByYear(),
    getElementsLatestMonth(),
  ]);

  const monthlyComparison = latestMonth
    ? await getElementsComparison(latestMonth)
    : null;

  return {
    yearlyData,
    pieceTypeSummary,
    latestMonth,
    monthlyComparison,
  };
}
