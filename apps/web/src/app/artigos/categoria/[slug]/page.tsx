import { notFound } from 'next/navigation';

import { ArticleCard } from '@/components/articles/ArticleCard';
import { fetchArticlesByCategory } from '@/lib/api/articles';
import { getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import('next').Metadata> {
  const { slug } = await params;
  const data = await fetchArticlesByCategory(slug);
  if (!data) {
    return { title: 'Categoria não encontrada' };
  }

  return {
    title: `${data.category.name} | Artigos`,
    description: `Artigos publicados na categoria ${data.category.name}.`,
    alternates: {
      canonical: `${getSiteBaseUrl()}/artigos/categoria/${data.category.slug}`,
    },
  };
}

export default async function ArtigosCategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const data = await fetchArticlesByCategory(slug);
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <header className="mb-8 space-y-2">
        <p className="text-sm text-neutral-500">
          <span className="underline decoration-neutral-300 underline-offset-[3px]">
            #{data.category.slug}
          </span>
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {data.category.name}
        </h1>
        <p className="text-sm text-neutral-500">
          {data.items.length} artigo{data.items.length === 1 ? '' : 's'} publicado
          {data.items.length === 1 ? '' : 's'}
        </p>
      </header>

      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Nenhum artigo publicado nesta categoria ainda.</p>
      )}
    </main>
  );
}
