import { notFound } from 'next/navigation';

import { extractProductSlugsFromBody } from '@ecommerce-amazon/shared/content';
import {
  articlePublicDetailSchema,
  autoLinksResponseSchema,
} from '@ecommerce-amazon/shared/admin';

import { ArticleAuthorBox } from '@/components/articles/ArticleAuthorBox';
import { ArticleBody, ArticleHero } from '@/components/articles/ArticleBody';
import { ArticleMetadataHeader } from '@/components/articles/ArticleMetadataHeader';
import { ArticleRelatedGrid } from '@/components/articles/ArticleRelatedGrid';
import { apiFetchParsed } from '@/lib/api/client';
import { productDetailSchema, type ProductDetailDto } from '@/lib/api/schemas';
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

async function getProductsBySlug(slugs: string[]): Promise<Record<string, ProductDetailDto | null>> {
  const entries = await Promise.all(
    slugs.map(async (productSlug) => {
      try {
        const product = await apiFetchParsed(
          `/products/${productSlug}`,
          productDetailSchema,
        );
        return [productSlug, product] as const;
      } catch {
        return [productSlug, null] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
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

  const slugs = extractProductSlugsFromBody(article.body);
  const productsBySlug = await getProductsBySlug(slugs);

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
      <ArticleMetadataHeader article={article} />
      <ArticleBody
        article={article}
        autoLinks={autoLinks.items}
        productsBySlug={productsBySlug}
      />
      {article.author ? <ArticleAuthorBox author={article.author} /> : null}
      <ArticleRelatedGrid articles={article.relatedArticles} />
    </main>
  );
}
