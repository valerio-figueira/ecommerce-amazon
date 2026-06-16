import { Skeleton } from '@/components/ui/skeleton';

export function ArticleCardSkeleton(): React.JSX.Element {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-neutral-200 bg-white"
      aria-hidden
    >
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-auto h-3 w-24" />
      </div>
    </div>
  );
}
