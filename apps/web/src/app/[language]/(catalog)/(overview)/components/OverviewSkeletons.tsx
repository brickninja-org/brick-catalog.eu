import { Card } from '@heroui/react/card';
import { Skeleton } from '@heroui/react/skeleton';

export function OverviewKpiCardSkeleton() {
  return (
    <Card>
      <Card.Content>
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-2xl"/>
          <Skeleton className="h-4 w-44 rounded-lg"/>
          <Skeleton className="ml-auto size-6 rounded-md"/>
        </div>
        <Skeleton className="mt-4 h-10 w-32 rounded-lg"/>
        <Skeleton className="mt-3 h-6 w-44 rounded-full"/>
      </Card.Content>
    </Card>
  );
}

export function OverviewChartCardSkeleton() {
  return (
    <Card>
      <Card.Content>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40 rounded-lg"/>
            <Skeleton className="h-4 w-48 rounded-lg"/>
          </div>
          <Skeleton className="size-9 rounded-lg"/>
        </div>
        <div className="flex h-[220px] items-end gap-3">
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex flex-1 flex-col items-center gap-2">
              <Skeleton className="h-4 w-10 rounded-lg"/>
              <Skeleton className="h-32 w-full rounded-t-xl"/>
              <Skeleton className="h-4 w-8 rounded-lg"/>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
