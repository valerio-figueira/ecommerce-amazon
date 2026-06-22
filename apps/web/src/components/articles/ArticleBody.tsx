import { RemoteImage } from '@/components/ui/RemoteImage';

import { parseArticleShortcodes } from '@ecommerce-amazon/shared/content';
import type { ArticlePublicDetail } from '@ecommerce-amazon/shared/admin';
import type { AutoLinksResponse } from '@ecommerce-amazon/shared/admin';
import type { ProductDetailDto } from '@/lib/api/schemas';

import { applyAutoLinksToHtml } from '@/lib/seo/apply-auto-links';

import { ArticleProductEmbed } from './ArticleProductEmbed';
import { ComparisonTable } from './ComparisonTable';

type ArticleBodyProps = {
  article: ArticlePublicDetail;
  autoLinks: AutoLinksResponse['items'];
  embeddedProducts: Record<string, ProductDetailDto | null>;
};

export function ArticleBody({
  article,
  autoLinks,
  embeddedProducts,
}: ArticleBodyProps): React.JSX.Element {
  const linkedHtml = applyAutoLinksToHtml(article.body, autoLinks, 'articles', {
    articleId: article.id,
    pagePath: `/artigos/${article.slug}`,
  });
  const segments = parseArticleShortcodes(linkedHtml);

  return (
    <article className="prose prose-neutral max-w-none">
      {segments.map((segment, index) => {
        if (segment.type === 'html') {
          if (segment.html.trim() === '') return null;
          return <div key={`html-${index}`} dangerouslySetInnerHTML={{ __html: segment.html }} />;
        }

        if (segment.type === 'compare') {
          const products = segment.slugs.map((slug) => embeddedProducts[slug] ?? null);
          return (
            <aside
              key={`compare-${segment.slugs.join('-')}-${index}`}
              className="not-prose my-8"
              aria-label="Comparativo de produtos"
            >
              <ComparisonTable slugs={segment.slugs} products={products} articleId={article.id} />
            </aside>
          );
        }

        const product = embeddedProducts[segment.slug] ?? null;
        return (
          <aside
            key={`product-${segment.slug}-${index}`}
            className="not-prose my-6 sm:my-8"
            aria-label="Produto recomendado"
          >
            <ArticleProductEmbed slug={segment.slug} product={product} articleId={article.id} />
          </aside>
        );
      })}
    </article>
  );
}

type ArticleHeroProps = {
  article: ArticlePublicDetail;
};

export function ArticleHero({ article }: ArticleHeroProps): React.JSX.Element {
  return (
    <header className="mb-10 space-y-4">
      {article.coverImageUrl ? (
        <div className="relative aspect-[21/9] overflow-hidden rounded-[var(--radius)]">
          <RemoteImage
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 960px"
          />
        </div>
      ) : null}
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{article.title}</h1>
        {article.excerpt ? <p className="text-lg text-neutral-600">{article.excerpt}</p> : null}
      </div>
    </header>
  );
}
