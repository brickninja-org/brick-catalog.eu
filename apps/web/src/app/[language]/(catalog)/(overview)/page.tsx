import type { Metadata } from 'next';

import { Typography } from '@heroui/react/typography';
import { Suspense } from 'react';

import { PageLayout } from '@/components/layout/PageLayout';

import { AnimatedGrid } from './components/AnimatedGrid';
import { AnimatedSection } from './components/AnimatedSection';
import { MonthlyChangeSummary } from './components/MonthlyChangeSummary';
import { PieceTypeBreakdownChart, YearlyElementsChart } from './components/OverviewBarCharts';
import { OverviewKpiCardSkeleton } from './components/OverviewSkeletons';
import { SummaryCard } from './components/SummaryCard';

const OverviewPage = () => {
  return (
    <PageLayout>
      <section className="flex flex-col gap-8">
        <AnimatedGrid className="grid grid-cols-12 gap-4">
          <AnimatedSection className="col-span-12 lg:col-span-4">
            <div className="flex flex-col justify-center gap-2">
              <Typography type="h1">Overview</Typography>
            </div>
          </AnimatedSection>

          <AnimatedSection className="col-span-12 lg:col-span-4">
            <Suspense fallback={<OverviewKpiCardSkeleton/>}>
              <SummaryCard/>
            </Suspense>
          </AnimatedSection>

          <AnimatedSection className="col-span-12 lg:col-span-4">
            <Suspense fallback={<OverviewKpiCardSkeleton/>}>
              <MonthlyChangeSummary/>
            </Suspense>
          </AnimatedSection>

          <AnimatedSection className="col-span-12 lg:col-span-6">
            <YearlyElementsChart/>
          </AnimatedSection>

          <AnimatedSection className="col-span-12 lg:col-span-6">
            <PieceTypeBreakdownChart/>
          </AnimatedSection>
        </AnimatedGrid>
      </section>
    </PageLayout>
  );
};

export default OverviewPage;

export function generateStaticParams() {
  const languages = ['de', 'en', 'nl'];

  return languages.map((language) => ({ language }));
}

export const metadata: Metadata = {
  title: 'Track LEGO elements | Latest Statistics',
  description: 'Explore yearly LEGO element trends, monthly deltas, and piece type breakdowns.',
  openGraph: {
    title: 'Track LEGO elements | Latest Statistics',
    description: 'Explore yearly LEGO element trends, monthly deltas, and piece type breakdowns.',
    type: 'website',
    siteName: 'brick-catalog.eu',
  },
};
