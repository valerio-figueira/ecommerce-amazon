import { Suspense } from 'react';

import type { ArticlePublicDetail } from '@ecommerce-amazon/shared/admin';
import {
  buildArticleJsonLd,
  buildNotFoundMetadata,
  buildPageCanonical,
} from '@ecommerce-amazon/shared/seo';
import { EngagementEventType } from '@ecommerce-amazon/shared/analytics';

import { ArticleBody, ArticleHero } from '@/components/articles/ArticleBody';
import { ArticleClusterCarousel } from '@/components/articles/ArticleClusterCarousel';
import { ArticlePostFooter } from '@/components/articles/ArticlePostFooter';
import { ArticleRelatedGrid } from '@/components/articles/ArticleRelatedGrid';
import { ArticleSeoAnchor } from '@/components/articles/ArticleSeoAnchor';
import { TrackEngagement } from '@/components/analytics/TrackEngagement';
import { ArticleDetailBodySkeleton } from '@/components/loading/ArticleDetailBodySkeleton';
import { getAutoLinks } from '@/lib/api/auto-links';
import { getArticle } from '@/lib/api/cached-fetchers';
import { getServerBrandConfig, getSiteBaseUrl } from '@/lib/site-url';

type ArticleDetailMainProps = {
  article: ArticlePublicDetail;
  slug: string;
};

async function ArticleBodySection({
  article,
}: {
  article: NonNullable<Awaited<ReturnType<typeof getArticle>>>;
}): Promise<React.JSX.Element> {
  const autoLinks = await getAutoLinks();

  return (
    <ArticleBody
      article={article}
      autoLinks={autoLinks.items}
      embeddedProducts={article.embeddedProducts}
    />
  );
}

export function ArticleDetailMain({ article, slug }: ArticleDetailMainProps): React.JSX.Element {
  const brand = getServerBrandConfig();
  const siteBaseUrl = getSiteBaseUrl();
  const jsonLd = buildArticleJsonLd({
    siteBaseUrl,
    brand,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    coverImageUrl: article.coverImageUrl,
    author: article.author,
    categoryName: article.category?.name ?? null,
    cluster: article.cluster
      ? {
          name: article.cluster.name,
          role: article.cluster.role,
          members: article.cluster.members.map((member) => ({
            slug: member.slug,
            title: member.title,
            isPilar: member.isPilar,
          })),
        }
      : null,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleHero article={article} />
      {article.cluster ? <ArticleSeoAnchor cluster={article.cluster} currentSlug={slug} /> : null}
      <TrackEngagement eventType={EngagementEventType.ARTICLE_PAGE_VIEW} articleId={article.id} />
      <Suspense fallback={<ArticleDetailBodySkeleton />}>
        <ArticleBodySection article={article} />
      </Suspense>
      <ArticlePostFooter article={article} />
      {article.cluster ? (
        <ArticleClusterCarousel cluster={article.cluster} currentSlug={slug} />
      ) : null}
      <ArticleRelatedGrid articles={article.relatedArticles} />
    </>
  );
}

export async function generateArticleDetailMetadata(
  params: Promise<{ slug: string }>,
): Promise<import('next').Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    return buildNotFoundMetadata('Artigo não encontrado');
  }

  const brand = getServerBrandConfig();
  const canonical = buildPageCanonical(`/artigos/${article.slug}`, brand);
  const title = article.seoTitle ?? article.title;
  const description = article.seoDescription ?? article.excerpt;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      siteName: brand.name,
      ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}),
      ...((article.updatedAt ?? article.publishedAt)
        ? { modifiedTime: article.updatedAt ?? article.publishedAt }
        : {}),
      ...(article.coverImageUrl ? { images: [{ url: article.coverImageUrl }] } : {}),
    },
  };
}
