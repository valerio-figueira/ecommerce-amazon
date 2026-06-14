import {
  ArticleStatus,
  ContentArticle,
  type CacheStore,
  type ArticleCategoryRepository,
  type ContentRepository,
  type OperatorRepository,
} from '@ecommerce-amazon/domain';

export type ArticleAuthorPublic = {
  name: string;
  avatarUrl: string | null;
  bio: string | null;
};

export type ArticleCategoryPublic = {
  name: string;
  slug: string;
};

export type ArticleRelatedSummary = {
  slug: string;
  title: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
};

export type ArticleWithEmbedsResult = {
  article: ContentArticle;
  author: ArticleAuthorPublic | null;
  category: ArticleCategoryPublic | null;
  relatedArticles: ArticleRelatedSummary[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isArticleWithEmbedsResult(value: unknown): value is ArticleWithEmbedsResult {
  return isRecord(value) && isRecord(value['article']);
}

export class GetArticleWithEmbeds {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly operatorRepository: OperatorRepository,
    private readonly articleCategoryRepository: ArticleCategoryRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(slug: string): Promise<ArticleWithEmbedsResult | null> {
    const cacheKey = `vitrine:article:slug:${slug}`;
    const cached = await this.cache.get(cacheKey);
    if (isArticleWithEmbedsResult(cached)) {
      return cached;
    }

    const article = await this.contentRepository.findArticleBySlug(slug);
    if (!article || article.status !== ArticleStatus.PUBLISHED) return null;

    let author: ArticleAuthorPublic | null = null;
    if (article.authorId) {
      const operator = await this.operatorRepository.findById(article.authorId);
      if (operator) {
        author = {
          name: operator.name,
          avatarUrl: operator.avatarUrl,
          bio: operator.bio,
        };
      }
    }

    let category: ArticleCategoryPublic | null = null;
    if (article.categoryId) {
      const articleCategory = await this.articleCategoryRepository.findById(article.categoryId);
      if (articleCategory) {
        category = {
          name: articleCategory.name,
          slug: articleCategory.slug,
        };
      }
    }

    let relatedArticles: ArticleRelatedSummary[] = [];
    if (article.categoryId) {
      relatedArticles = await this.contentRepository.findRelatedPublishedByCategory(
        article.categoryId,
        article.id,
        3,
      );
    }

    const result: ArticleWithEmbedsResult = { article, author, category, relatedArticles };
    await this.cache.set(cacheKey, result, 900);
    return result;
  }
}
