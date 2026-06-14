import Image from 'next/image';
import Link from 'next/link';

import type { ArticleRelatedSummary } from '@ecommerce-amazon/shared/admin';

type ArticleCardProps = {
  article: ArticleRelatedSummary;
};

function formatPublishedDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ArticleCard({ article }: ArticleCardProps): React.JSX.Element {
  const publishedLabel = formatPublishedDate(article.publishedAt);

  return (
    <Link
      href={`/artigos/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-neutral-200 bg-white transition hover:border-neutral-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            Sem capa
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-neutral-900 group-hover:text-neutral-700">
          {article.title}
        </h3>
        {publishedLabel ? (
          <p className="text-xs text-neutral-500">{publishedLabel}</p>
        ) : null}
      </div>
    </Link>
  );
}
