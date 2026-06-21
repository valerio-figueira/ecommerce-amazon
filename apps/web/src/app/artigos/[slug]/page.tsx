import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import {
  ArticleDetailMain,
  generateArticleDetailMetadata,
} from '@/components/articles/ArticleDetailMain';
import { ArticleDetailHeroSkeleton } from '@/components/loading/ArticleDetailHeroSkeleton';
import { getArticle } from '@/lib/api/cached-fetchers';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import('next').Metadata> {
  return generateArticleDetailMetadata(params);
}

export default async function ArtigoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <Suspense fallback={<ArticleDetailHeroSkeleton />}>
        <ArticleDetailMain article={article} slug={slug} />
      </Suspense>
    </main>
  );
}
