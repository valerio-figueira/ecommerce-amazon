import { notFound } from 'next/navigation';

import {
  articlePublicDetailSchema,
  autoLinksResponseSchema,
  resolveArticleUpdatedAtIso,
  type ArticlePublicDetail,
} from '@ecommerce-amazon/shared/admin';
import {
  buildArticleJsonLd,
  buildNotFoundMetadata,
  buildPageCanonical,
} from '@ecommerce-amazon/shared/seo';

import { ArticleBody, ArticleHero } from '@/components/articles/ArticleBody';
import { ArticleClusterCarousel } from '@/components/articles/ArticleClusterCarousel';
import { ArticlePostFooter } from '@/components/articles/ArticlePostFooter';
import { ArticleRelatedGrid } from '@/components/articles/ArticleRelatedGrid';
import { ArticleSeoAnchor } from '@/components/articles/ArticleSeoAnchor';
import { TrackEngagement } from '@/components/analytics/TrackEngagement';
import { EngagementEventType } from '@ecommerce-amazon/shared/analytics';
import { apiFetchParsed } from '@/lib/api/client';
import { fetchOrNotFound } from '@/lib/api/safe-fetch';
import { getServerBrandConfig, getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

async function getArticle(slug: string): Promise<ArticlePublicDetail | null> {
  const article = await fetchOrNotFound(`/articles/${slug}`, articlePublicDetailSchema);
  if (!article) {
    return null;
  }

  return {
    ...article,
    cluster: article.cluster ?? null,
    updatedAt: resolveArticleUpdatedAtIso(article),
  };
}

async function getAutoLinks() {
  try {
    return await apiFetchParsed('/seo/auto-links', autoLinksResponseSchema, {
      next: { revalidate: 3600 },
    });
  } catch {
    return { items: [] };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import('next').Metadata> {
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
      ...(article.updatedAt ?? article.publishedAt
        ? { modifiedTime: resolveArticleUpdatedAtIso(article) }
        : {}),
      ...(article.coverImageUrl ? { images: [{ url: article.coverImageUrl }] } : {}),
    },
  };
}

export default async function ArtigoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const [article, autoLinks] = await Promise.all([getArticle(slug), getAutoLinks()]);
  if (!article) notFound();

  const brand = getServerBrandConfig();
  const siteBaseUrl = getSiteBaseUrl();
  const jsonLd = buildArticleJsonLd({
    siteBaseUrl,
    brand,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt,
    updatedAt: resolveArticleUpdatedAtIso(article),
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
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleHero article={article} />
      {article.cluster ? (
        <ArticleSeoAnchor cluster={article.cluster} currentSlug={slug} />
      ) : null}
      <TrackEngagement
        eventType={EngagementEventType.ARTICLE_PAGE_VIEW}
        articleId={article.id}
      />
      <ArticleBody
        article={article}
        autoLinks={autoLinks.items}
        embeddedProducts={article.embeddedProducts}
      />
      <ArticlePostFooter article={article} />
      {article.cluster ? (
        <ArticleClusterCarousel cluster={article.cluster} currentSlug={slug} />
      ) : null}
      <ArticleRelatedGrid articles={article.relatedArticles} />
    </main>
  );
}
