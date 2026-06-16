import { BentoHubMixSkeleton } from '@/components/blocks/BentoHubMixSkeleton';
import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';
import { Skeleton } from '@/components/ui/skeleton';

export function HomePageSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6" aria-busy="true">
      <LoadingAnnouncer />

      <div className="space-y-10">
        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2" aria-hidden>
          <BentoHubMixSkeleton variant="hero" />
          <BentoHubMixSkeleton variant="offer" />
          <BentoHubMixSkeleton variant="list" />
        </div>

        <div className="space-y-4" aria-hidden>
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="aspect-[4/3] min-w-[72%] flex-[0_0_72%] rounded-2xl sm:min-w-[48%] sm:flex-[0_0_48%] md:min-w-[32%] md:flex-[0_0_32%]"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4" aria-hidden>
          <Skeleton className="h-7 w-56" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
