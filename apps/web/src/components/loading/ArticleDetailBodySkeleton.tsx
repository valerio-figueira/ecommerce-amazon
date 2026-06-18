import { Skeleton } from '@/components/ui/skeleton';

export function ArticleDetailBodySkeleton(): React.JSX.Element {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
