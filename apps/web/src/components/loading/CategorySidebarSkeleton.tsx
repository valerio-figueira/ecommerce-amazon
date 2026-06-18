import { Skeleton } from '@/components/ui/skeleton';

export function CategorySidebarSkeleton(): React.JSX.Element {
  return (
    <aside className="mb-8 hidden lg:block" aria-hidden>
      <Skeleton className="mb-3 h-3 w-20" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full rounded-md" />
        ))}
      </div>
    </aside>
  );
}
