import { ArticleListingGridSkeleton } from '@/components/loading/ArticleListingGridSkeleton';
import { ArticleListingToolbarSkeleton } from '@/components/loading/ArticleListingToolbarSkeleton';
import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';

export default function Loading(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10" aria-busy="true">
      <LoadingAnnouncer />

      <div className="space-y-8">
        <ArticleListingToolbarSkeleton />
        <ArticleListingGridSkeleton />
      </div>
    </main>
  );
}
