import type { ContentArticle } from '@ecommerce-amazon/domain';
import type { ArticlePublicDetail } from '@ecommerce-amazon/shared/admin';

export function toArticlePublicDetailDto(
  article: ContentArticle,
  authorName: string | null,
): ArticlePublicDetail {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImageUrl,
    body: article.body,
    type: article.type,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    authorName,
    publishedAt: article.publishedAt?.toISOString() ?? null,
  };
}
