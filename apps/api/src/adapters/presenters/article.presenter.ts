import type { ArticleWithEmbedsResult } from '@ecommerce-amazon/application';
import type { ArticlePublicDetail } from '@ecommerce-amazon/shared/admin';
import { toIsoDateTime } from '@ecommerce-amazon/shared/admin';

import { toProductDetailDto } from './product.presenter.js';

export function toArticlePublicDetailDto(result: ArticleWithEmbedsResult): ArticlePublicDetail {
  const { article, author, category, relatedArticles, embeddedProducts, cluster } = result;

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImageUrl,
    body: article.body,
    type: article.type,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    author,
    category,
    relatedArticles: relatedArticles.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      coverImageUrl: item.coverImageUrl,
      publishedAt: item.publishedAt != null ? toIsoDateTime(item.publishedAt) : null,
    })),
    publishedAt: article.publishedAt ? toIsoDateTime(article.publishedAt) : null,
    updatedAt: toIsoDateTime(article.updatedAt, article.publishedAt ?? article.createdAt),
    embeddedProducts: Object.fromEntries(
      Object.entries(embeddedProducts).map(([productSlug, product]) => [
        productSlug,
        product ? toProductDetailDto(product) : null,
      ]),
    ),
    cluster: cluster
      ? {
          name: cluster.name,
          slug: cluster.slug,
          description: cluster.description,
          role: cluster.role,
          pilarArticle: cluster.pilarArticle,
          members: cluster.members.map((member) => ({
            id: member.id,
            slug: member.slug,
            title: member.title,
            excerpt: member.excerpt,
            coverImageUrl: member.coverImageUrl,
            publishedAt: member.publishedAt != null ? toIsoDateTime(member.publishedAt) : null,
            isPilar: member.isPilar,
          })),
        }
      : null,
  };
}
