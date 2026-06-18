import { CategoryHeaderSkeleton } from '@/components/loading/CategoryHeaderSkeleton';
import { CategorySidebarSkeleton } from '@/components/loading/CategorySidebarSkeleton';
import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';
import { ProductGridSkeleton } from '@/components/loading/ProductGridSkeleton';

export default function Loading(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8" aria-busy="true">
      <LoadingAnnouncer />

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <CategorySidebarSkeleton />

        <div className="min-w-0">
          <CategoryHeaderSkeleton />
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </main>
  );
}
