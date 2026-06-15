import {
  ArticleStatus,
  ContentArticle,
  PriceComplianceService,
  type Product,
  type CacheStore,
  type ArticleCategoryRepository,
  type ContentRepository,
  type OperatorRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import { extractAllEmbedSlugsFromBody } from '@ecommerce-amazon/shared/content';
import { articlePublicCacheKey } from '@ecommerce-amazon/shared/cache';

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
  embeddedProducts: Record<string, Product | null>;
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
    private readonly productRepository: ProductRepository,
    private readonly cache: CacheStore,
    private readonly compliance = new PriceComplianceService(),
  ) {}

  async execute(slug: string): Promise<ArticleWithEmbedsResult | null> {
    const cacheKey = articlePublicCacheKey(slug);
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

    const embedSlugs = extractAllEmbedSlugsFromBody(article.body);
    const productResults = await Promise.all(
      embedSlugs.map(async (productSlug) => {
        const product = await this.productRepository.findBySlug(productSlug);
        if (!product) {
          return [productSlug, null] as const;
        }
        if (this.compliance.isStale(product.price.updatedAt)) {
          product.markPriceStale();
        }
        return [productSlug, product] as const;
      }),
    );
    const embeddedProducts = Object.fromEntries(productResults);

    const result: ArticleWithEmbedsResult = {
      article,
      author,
      category,
      relatedArticles,
      embeddedProducts,
    };
    await this.cache.set(cacheKey, result, 900);
    return result;
  }
}
