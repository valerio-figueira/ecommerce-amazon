import Image from 'next/image';

import { injectInternalLinks } from '@ecommerce-amazon/shared/seo';
import { parseArticleShortcodes } from '@ecommerce-amazon/shared/content';
import type { ArticlePublicDetail } from '@ecommerce-amazon/shared/admin';
import type { AutoLinksResponse } from '@ecommerce-amazon/shared/admin';
import type { ProductListItemDto } from '@/lib/api/types';

import { ArticleProductEmbed } from './ArticleProductEmbed';

type ArticleBodyProps = {
  article: ArticlePublicDetail;
  autoLinks: AutoLinksResponse['items'];
  productsBySlug: Record<string, ProductListItemDto | null>;
};

export function ArticleBody({
  article,
  autoLinks,
  productsBySlug,
}: ArticleBodyProps): React.JSX.Element {
  const linkedHtml = injectInternalLinks(article.body, autoLinks);
  const segments = parseArticleShortcodes(linkedHtml);

  return (
    <div className="space-y-6">
      {segments.map((segment, index) => {
        if (segment.type === 'html') {
          if (segment.html.trim() === '') return null;
          return (
            <div
              key={`html-${index}`}
              className="prose prose-neutral max-w-none"
              dangerouslySetInnerHTML={{ __html: segment.html }}
            />
          );
        }

        const product = productsBySlug[segment.slug] ?? null;
        return (
          <ArticleProductEmbed
            key={`product-${segment.slug}-${index}`}
            slug={segment.slug}
            product={product}
          />
        );
      })}
    </div>
  );
}

type ArticleHeroProps = {
  article: ArticlePublicDetail;
};

export function ArticleHero({ article }: ArticleHeroProps): React.JSX.Element {
  const publishedLabel = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

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
        <p className="text-sm text-neutral-500">
          {article.authorName ? `${article.authorName}` : 'Redação Vitrine'}
          {publishedLabel ? ` · ${publishedLabel}` : ''}
        </p>
      </div>
    </header>
  );
}
