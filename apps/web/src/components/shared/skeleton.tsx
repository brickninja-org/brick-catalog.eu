import { cn, Skeleton as HeroUISkeleton } from "@heroui/react";

interface ListSkeletonProps {
  count: number,
  itemHeight?: string,
}

export function ListSkeleton({
  count,
  itemHeight = 'h-20',
}: ListSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <HeroUISkeleton
          key={i}
          className={cn('w-full rounded-lg', itemHeight)}
        />
      ))}
    </div>
  );
}