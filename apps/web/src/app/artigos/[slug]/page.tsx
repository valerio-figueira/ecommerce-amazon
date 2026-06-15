import { notFound } from 'next/navigation';

import {
  articlePublicDetailSchema,
  autoLinksResponseSchema,
} from '@ecommerce-amazon/shared/admin';

import { ArticleBody, ArticleHero } from '@/components/articles/ArticleBody';
import { ArticleClusterCarousel } from '@/components/articles/ArticleClusterCarousel';
import { ArticlePostFooter } from '@/components/articles/ArticlePostFooter';
import { ArticleRelatedGrid } from '@/components/articles/ArticleRelatedGrid';
import { ArticleSeoAnchor } from '@/components/articles/ArticleSeoAnchor';
import { TrackEngagement } from '@/components/analytics/TrackEngagement';
import { EngagementEventType } from '@ecommerce-amazon/shared/analytics';
import { apiFetchParsed } from '@/lib/api/client';
import { fetchOrNotFound } from '@/lib/api/safe-fetch';
import { getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

async function getArticle(slug: string) {
  return fetchOrNotFound(`/articles/${slug}`, articlePublicDetailSchema);
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
    return { title: 'Artigo não encontrado' };
  }

  const siteBaseUrl = getSiteBaseUrl();
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
    alternates: {
      canonical: `${siteBaseUrl}/artigos/${article.slug}`,
    },
    openGraph: {
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.excerpt,
      type: 'article',
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

  const authorName = article.author?.name ?? 'Vitrine';
  const jsonLdGraph: Record<string, unknown>[] = [
    {
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      datePublished: article.publishedAt,
      author: article.author
        ? {
            '@type': 'Person',
            name: authorName,
            ...(article.author.avatarUrl ? { image: article.author.avatarUrl } : {}),
          }
        : { '@type': 'Organization', name: 'Vitrine' },
      ...(article.category ? { articleSection: article.category.name } : {}),
      ...(article.coverImageUrl ? { image: [article.coverImageUrl] } : {}),
    },
  ];

  if (article.cluster?.role === 'pilar') {
    const spokes = article.cluster.members.filter((member) => !member.isPilar);
    if (spokes.length > 0) {
      const siteBaseUrl = getSiteBaseUrl();
      jsonLdGraph.push({
        '@type': 'ItemList',
        name: article.cluster.name,
        itemListElement: spokes.map((member, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: member.title,
          url: `${siteBaseUrl}/artigos/${member.slug}`,
        })),
      });
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': jsonLdGraph,
  };

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
