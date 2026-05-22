import { Card } from '@heroui/react/card';
import { Suspense } from 'react';

import { getPieceTypeSummaryByYear } from '@/queries/elements/piece-type-summary-by-year';
import { getYearlyElements } from '@/queries/elements/yearly-statistics';

import { OverviewChartCardSkeleton } from './OverviewSkeletons';
import { PieceTypeBreakdownBarChart } from './PieceTypeBreakdownBarChart.client';
import { YearlyElementsBarChart } from './YearlyElementsBarChart.client';

async function YearlyElementsChartContent() {
  const data = await getYearlyElements();

  return <YearlyElementsBarChart data={data}/>;
}

async function PieceTypeBreakdownChartContent() {
  const summary = await getPieceTypeSummaryByYear();

  if (!summary) {
    return (
      <Card>
        <Card.Content>
          <p className="text-muted text-sm">No piece type data available yet.</p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <PieceTypeBreakdownBarChart
      duplo={summary.duplo}
      lego={summary.lego}
      technic={summary.technic}
      total={summary.total}
      year={summary.year}
    />
  );
}

export function YearlyElementsChart() {
  return (
    <Suspense fallback={<OverviewChartCardSkeleton/>}>
      <YearlyElementsChartContent/>
    </Suspense>
  );
}

export function PieceTypeBreakdownChart() {
  return (
    <Suspense fallback={<OverviewChartCardSkeleton/>}>
      <PieceTypeBreakdownChartContent/>
    </Suspense>
  );
}
