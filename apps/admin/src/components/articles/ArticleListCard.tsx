import { Trash2 } from 'lucide-react';
import Link from 'next/link';

import { ProductThumbnail } from '@/components/products/ProductThumbnail';
import { Button } from '@/components/ui/button';
import {
  adminArticleStatusLabel,
  formatAdminArticleUpdatedAt,
} from '@/lib/article-admin-format';
import { cn } from '@/lib/utils';
import { ArticleStatus } from '@ecommerce-amazon/domain';
import type { AdminArticleSummary } from '@ecommerce-amazon/shared/admin';

type ArticleListCardProps = {
  article: AdminArticleSummary;
  onDelete: (article: AdminArticleSummary) => void;
};

export function ArticleListCard({
  article,
  onDelete,
}: ArticleListCardProps): React.JSX.Element {
  const isPublished = article.status === ArticleStatus.PUBLISHED;
  const coverSrc = article.coverImageUrl ?? undefined;

  return (
    <article className="admin-article-card">
      <div className="admin-article-card__media-wrap">
        <Link
          href={`/artigos/${article.id}`}
          className="admin-article-card__media"
          aria-label={`Editar ${article.title}`}
        >
          <ProductThumbnail src={coverSrc} alt={article.title} size="cover" />
        </Link>
        <span
          className={cn(
            'admin-article-card__status cms-status-pill',
            isPublished ? 'is-published' : 'is-draft',
          )}
        >
          {adminArticleStatusLabel(article.status)}
        </span>
      </div>

      <div className="admin-article-card__body">
        <Link
          href={`/artigos/${article.id}`}
          className="admin-article-card__title hover:text-[var(--admin-primary)] hover:underline"
        >
          {article.title}
        </Link>

        {article.excerpt ? (
          <p className="admin-article-card__excerpt">{article.excerpt}</p>
        ) : null}

        <p className="admin-article-card__meta">
          /artigos/{article.slug} · Atualizado {formatAdminArticleUpdatedAt(article.updatedAt)}
        </p>

        <div className="admin-article-card__spacer" aria-hidden />

        <div className="admin-article-card__actions">
          <Button asChild variant="primary" size="sm" className="h-8 flex-1 px-3 text-xs">
            <Link href={`/artigos/${article.id}`}>Editar artigo</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 px-2.5 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => onDelete(article)}
            aria-label={`Excluir ${article.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}
