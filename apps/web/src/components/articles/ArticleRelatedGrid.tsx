import type { ArticleRelatedSummary } from '@ecommerce-amazon/shared/admin';

import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';

import { ArticleCard } from './ArticleCard';

type ArticleRelatedGridProps = {
  articles: ArticleRelatedSummary[];
};

export function ArticleRelatedGrid({
  articles,
}: ArticleRelatedGridProps): React.JSX.Element | null {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12" aria-label="Artigos relacionados">
      <h2 className="mb-6 text-xl font-semibold text-neutral-900">Artigos relacionados</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard
            key={article.slug}
            article={article}
            engagementPlacement={ClickPlacement.ARTICLE_RELATED}
          />
        ))}
      </div>
    </section>
  );
}
