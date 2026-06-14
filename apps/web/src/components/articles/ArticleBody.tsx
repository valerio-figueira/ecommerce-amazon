import Image from 'next/image';

import { injectInternalLinks } from '@ecommerce-amazon/shared/seo';
import { parseArticleShortcodes } from '@ecommerce-amazon/shared/content';
import type { ArticlePublicDetail } from '@ecommerce-amazon/shared/admin';
import type { AutoLinksResponse } from '@ecommerce-amazon/shared/admin';
import type { ProductDetailDto } from '@/lib/api/schemas';

import { ArticleProductEmbed } from './ArticleProductEmbed';

type ArticleBodyProps = {
  article: ArticlePublicDetail;
  autoLinks: AutoLinksResponse['items'];
  productsBySlug: Record<string, ProductDetailDto | null>;
};

export function ArticleBody({
  article,
  autoLinks,
  productsBySlug,
}: ArticleBodyProps): React.JSX.Element {
  const linkedHtml = injectInternalLinks(
    article.body,
    autoLinks.map((item) => ({
      keyword: item.keyword,
      targetUrl: item.targetUrl,
      maxMatches: item.maxMatches,
      ...(item.priority !== undefined ? { priority: item.priority } : {}),
    })),
  );
  const segments = parseArticleShortcodes(linkedHtml);

  return (
    <article className="prose prose-neutral max-w-none">
      {segments.map((segment, index) => {
        if (segment.type === 'html') {
          if (segment.html.trim() === '') return null;
          return (
            <div key={`html-${index}`} dangerouslySetInnerHTML={{ __html: segment.html }} />
          );
        }

        const product = productsBySlug[segment.slug] ?? null;
        return (
          <aside
            key={`product-${segment.slug}-${index}`}
            className="not-prose my-8"
            aria-label="Produto recomendado"
          >
            <ArticleProductEmbed slug={segment.slug} product={product} />
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
          <Image
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
        {article.excerpt ? (
          <p className="text-lg text-neutral-600">{article.excerpt}</p>
        ) : null}
      </div>
    </header>
  );
}
