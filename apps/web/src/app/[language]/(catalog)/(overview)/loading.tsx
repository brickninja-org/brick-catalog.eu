import { Skeleton } from '@heroui/react/skeleton';

import { PageLayout } from '@/components/layout/PageLayout';

import { OverviewChartCardSkeleton, OverviewKpiCardSkeleton } from './components/OverviewSkeletons';

export default function Loading() {
  return (
    <PageLayout>
      <section className="flex flex-col gap-8">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4">
            <div className="flex flex-col justify-center gap-2">
              <Skeleton className="h-10 w-44 rounded-lg"/>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <OverviewKpiCardSkeleton/>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <OverviewKpiCardSkeleton/>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <OverviewChartCardSkeleton/>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <OverviewChartCardSkeleton/>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
