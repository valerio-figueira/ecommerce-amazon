import { Skeleton } from '@/components/ui/skeleton';

export function HeaderSkeleton(): React.JSX.Element {
  return (
    <header
      className="sticky top-0 z-40 border-b border-neutral-200/80 bg-[var(--background)]/95 backdrop-blur"
      aria-hidden
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
          <Skeleton className="h-6 w-28 shrink-0 md:h-7 md:w-36" />
          <Skeleton className="hidden h-9 w-24 rounded-lg sm:block" />
          <Skeleton className="h-9 w-9 rounded-lg sm:hidden" />
          <div className="hidden items-center gap-4 sm:flex md:gap-5">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </header>
  );
}
