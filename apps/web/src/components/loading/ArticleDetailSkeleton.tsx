import { ArticleDetailHeroSkeleton } from '@/components/loading/ArticleDetailHeroSkeleton';
import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';

export function ArticleDetailSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6" aria-busy="true">
      <LoadingAnnouncer />
      <ArticleDetailHeroSkeleton />
    </main>
  );
}
