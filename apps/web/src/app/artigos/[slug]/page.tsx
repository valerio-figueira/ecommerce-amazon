import { Suspense } from 'react';

import {
  ArticleDetailMain,
  generateArticleDetailMetadata,
} from '@/components/articles/ArticleDetailMain';
import { ArticleDetailHeroSkeleton } from '@/components/loading/ArticleDetailHeroSkeleton';
import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import('next').Metadata> {
  return generateArticleDetailMetadata(params);
}

export default function ArtigoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): React.JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6" aria-busy="true">
      <LoadingAnnouncer />
      <Suspense fallback={<ArticleDetailHeroSkeleton />}>
        <ArticleDetailMain params={params} />
      </Suspense>
    </main>
  );
}
