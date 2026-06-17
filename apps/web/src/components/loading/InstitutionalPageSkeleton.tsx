import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';
import { Skeleton } from '@/components/ui/skeleton';

export function InstitutionalPageSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14" aria-busy="true">
      <LoadingAnnouncer />

      <div className="space-y-10" aria-hidden>
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto h-10 w-full max-w-lg" />
          <Skeleton className="mx-auto h-5 w-full max-w-md" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="space-y-6 border-t border-neutral-100 pt-10">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <div className="space-y-6 border-t border-neutral-100 pt-10">
          <Skeleton className="h-7 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-xl border border-neutral-100 bg-white p-5"
              >
                <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
