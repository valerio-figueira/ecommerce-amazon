import { notFound } from 'next/navigation';

import {
  articlePublicDetailSchema,
  autoLinksResponseSchema,
} from '@ecommerce-amazon/shared/admin';

import { ArticleBody, ArticleHero } from '@/components/articles/ArticleBody';
import { ArticlePostFooter } from '@/components/articles/ArticlePostFooter';
import { ArticleRelatedGrid } from '@/components/articles/ArticleRelatedGrid';
import { apiFetchParsed } from '@/lib/api/client';
import { getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

async function getArticle(slug: string) {
  try {
    return await apiFetchParsed(`/articles/${slug}`, articlePublicDetailSchema);
  } catch {
    return null;
  }
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
  const jsonLd = {
    '@context': 'https://schema.org',
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
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleHero article={article} />
      <ArticleBody
        article={article}
        autoLinks={autoLinks.items}
        embeddedProducts={article.embeddedProducts}
      />
      <ArticlePostFooter article={article} />
      <ArticleRelatedGrid articles={article.relatedArticles} />
    </main>
  );
}
