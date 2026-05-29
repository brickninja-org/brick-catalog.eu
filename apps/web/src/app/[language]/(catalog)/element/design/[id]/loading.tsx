import { DetailLayout } from '@/components/layout/DetailLayout';

export default function loadingDesign() {
  return (
    <DetailLayout title={<div className="skeleton skeleton--shimmer"/>}>
      <div className="w-full max-w-sm space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 shrink-0 rouded-lg"/>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-full rounded"/>
            </div>
          </div>
        ))}
      </div>
    </DetailLayout>
  );
}
