import { Skeleton } from '@/components/ui/skeleton';

export function ArticleDetailHeroSkeleton(): React.JSX.Element {
  return (
    <>
      <header className="mb-10 space-y-4" aria-hidden>
        <Skeleton className="aspect-[21/9] rounded-[var(--radius)]" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </header>

      <div className="space-y-4" aria-hidden>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-2/3" />
      </div>
    </>
  );
}
