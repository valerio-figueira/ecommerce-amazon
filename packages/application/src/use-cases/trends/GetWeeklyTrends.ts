import {
  ArticleStatus,
  type AnalyticsRepository,
  type ContentRepository,
  type EngagementAnalyticsRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import { EngagementEventType } from '@ecommerce-amazon/shared/analytics';
import type {
  ArticleTrendDeliveryItem,
  ProductDeliveryItem,
  WeeklyTrendsProps,
  WeeklyTrendsRendered,
} from '@ecommerce-amazon/shared/cms';

import { toProductDeliveryItem } from '../../mappers/product-delivery.mapper.js';
import { applyPriceComplianceToProducts } from '../../services/apply-price-compliance.js';
import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';
import type { PublicPricePresentationOptions } from '../../mappers/product-price.mapper.js';

const WEEKLY_TRENDS_DAYS = 7;
const PERIOD_LABEL = 'últimos 7 dias';

export type GetWeeklyTrendsResult = WeeklyTrendsRendered | null;

export class GetWeeklyTrends {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly engagementAnalyticsRepository: EngagementAnalyticsRepository,
    private readonly productRepository: ProductRepository,
    private readonly contentRepository: ContentRepository,
    private readonly gateService: AffiliateScaleGateService,
  ) {}

  async execute(
    input: WeeklyTrendsProps,
    priceOptions?: PublicPricePresentationOptions,
  ): Promise<GetWeeklyTrendsResult> {
    const resolvedPriceOptions =
      priceOptions ??
      ({
        pricesEnabled: await this.gateService.isPricesEnabled(),
      } satisfies PublicPricePresentationOptions);
    const to = new Date();
    const from = new Date(to.getTime() - WEEKLY_TRENDS_DAYS * 24 * 60 * 60 * 1000);
    const fetchLimit = input.limit * 2;

    const [topProducts, topArticles] = await Promise.all([
      this.analyticsRepository.getTopClickedProducts(from, to, fetchLimit),
      this.engagementAnalyticsRepository.getTopArticlesByEvent(
        from,
        to,
        EngagementEventType.ARTICLE_PAGE_VIEW,
        fetchLimit,
      ),
    ]);

    const [products, articles] = await Promise.all([
      this.enrichProducts(topProducts, input.limit, resolvedPriceOptions),
      this.enrichArticles(topArticles, input.limit),
    ]);

    if (products.length < input.minItems && articles.length < input.minItems) {
      return null;
    }

    return {
      products,
      articles,
      periodLabel: PERIOD_LABEL,
    };
  }

  private async enrichProducts(
    ranked: Awaited<ReturnType<AnalyticsRepository['getTopClickedProducts']>>,
    limit: number,
    priceOptions: PublicPricePresentationOptions,
  ): Promise<ProductDeliveryItem[]> {
    if (ranked.length === 0) {
      return [];
    }

    const rankedIds = ranked.map((item) => item.productId);
    const productsById = await this.productRepository.findByIds(rankedIds);
    const byId = new Map<string, (typeof productsById)[number]>(
      productsById.map((product) => [product.id, product]),
    );

    const ordered = rankedIds
      .map((id) => byId.get(id))
      .filter((product): product is NonNullable<typeof product> => product !== undefined)
      .filter((product) => product.visible);

    applyPriceComplianceToProducts(ordered);

    return ordered.slice(0, limit).map((product) => toProductDeliveryItem(product, priceOptions));
  }

  private async enrichArticles(
    ranked: Awaited<ReturnType<EngagementAnalyticsRepository['getTopArticlesByEvent']>>,
    limit: number,
  ): Promise<ArticleTrendDeliveryItem[]> {
    if (ranked.length === 0) {
      return [];
    }

    const articles = await Promise.all(
      ranked.map((item) => this.contentRepository.findArticleById(item.articleId)),
    );

    return articles
      .filter((article): article is NonNullable<typeof article> => article !== null)
      .filter((article) => article.status === ArticleStatus.PUBLISHED)
      .slice(0, limit)
      .map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        coverImageUrl: article.coverImageUrl,
        publishedAt: article.publishedAt?.toISOString() ?? null,
      }));
  }
}
