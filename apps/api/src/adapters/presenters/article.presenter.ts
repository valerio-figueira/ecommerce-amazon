import type { ArticleWithEmbedsResult } from '@ecommerce-amazon/application';
import type { ArticlePublicDetail } from '@ecommerce-amazon/shared/admin';

export function toArticlePublicDetailDto(result: ArticleWithEmbedsResult): ArticlePublicDetail {
  const { article, author, category, relatedArticles } = result;

  return {
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
      slug: item.slug,
      title: item.title,
      coverImageUrl: item.coverImageUrl,
      publishedAt: item.publishedAt?.toISOString() ?? null,
    })),
    publishedAt: article.publishedAt?.toISOString() ?? null,
  };
}
