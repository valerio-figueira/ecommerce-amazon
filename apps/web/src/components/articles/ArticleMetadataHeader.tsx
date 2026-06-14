import Image from 'next/image';

import type { ArticlePublicDetail } from '@ecommerce-amazon/shared/admin';

type ArticleMetadataHeaderProps = {
  article: ArticlePublicDetail;
};

function formatPublishedDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function ArticleMetadataHeader({
  article,
}: ArticleMetadataHeaderProps): React.JSX.Element | null {
  const publishedLabel = formatPublishedDate(article.publishedAt);
  const authorName = article.author?.name ?? 'Redação Vitrine';
  const authorAvatar = article.author?.avatarUrl;

  if (!article.category && !publishedLabel && !article.author) {
    return null;
  }

  return (
    <div className="mb-8 space-y-3">
      {article.category ? (
        <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
          {article.category.name}
        </span>
      ) : null}

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
        {authorAvatar ? (
          <Image
            src={authorAvatar}
            alt={authorName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600"
            aria-hidden
          >
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <p className="text-sm text-neutral-600">
          <span className="font-medium text-neutral-900">{authorName}</span>
          {publishedLabel ? ` · ${publishedLabel}` : ''}
        </p>
      </div>
    </div>
  );
}
