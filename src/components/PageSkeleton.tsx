import { Skeleton } from '@/components/ui/skeleton';

export default function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="py-4 space-y-4">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full rounded-2xl" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
