import {
  ContentArticle,
  type CacheStore,
  type ContentRepository,
  type Product,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import { injectInternalLinks, SEO_KEYWORD_MAP } from '@ecommerce-amazon/shared/seo';

export type ArticleWithEmbedsResult = {
  article: ContentArticle;
  products: Product[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isArticleWithEmbedsResult(value: unknown): value is ArticleWithEmbedsResult {
  return (
    isRecord(value) &&
    isRecord(value['article']) &&
    Array.isArray(value['products'])
  );
}

export class GetArticleWithEmbeds {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly productRepository: ProductRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(slug: string): Promise<ArticleWithEmbedsResult | null> {
    const cacheKey = `vitrine:article:slug:${slug}`;
    const cached = await this.cache.get(cacheKey);
    if (isArticleWithEmbedsResult(cached)) {
      return cached;
    }

    const article = await this.contentRepository.findArticleBySlug(slug);
    if (!article) return null;

    const linkedArticle = ContentArticle.create({
      id: article.id,
      slug: article.slug,
      title: article.title,
      body: injectInternalLinks(article.body, SEO_KEYWORD_MAP),
      type: article.type,
      status: article.status,
      seo: article.seo,
      embeds: article.embeds,
      ...(article.publishedAt !== undefined ? { publishedAt: article.publishedAt } : {}),
    });

    const products = await this.productRepository.findByIds(
      linkedArticle.embeds.map((e) => e.productId),
    );
    const result: ArticleWithEmbedsResult = { article: linkedArticle, products };
    await this.cache.set(cacheKey, result, 900);
    return result;
  }
}
