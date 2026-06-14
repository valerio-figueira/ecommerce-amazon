import {
  ArticleStatus,
  ContentArticle,
  type CacheStore,
  type ContentRepository,
  type OperatorRepository,
} from '@ecommerce-amazon/domain';

export type ArticleWithEmbedsResult = {
  article: ContentArticle;
  authorName: string | null;
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

    let authorName: string | null = null;
    if (article.authorId) {
      const operator = await this.operatorRepository.findById(article.authorId);
      authorName = operator?.name ?? null;
    }

    const result: ArticleWithEmbedsResult = { article, authorName };
    await this.cache.set(cacheKey, result, 900);
    return result;
  }
}
