import { asc, and, count, desc, eq, ilike, inArray, ne, or } from 'drizzle-orm';

import {
  ArticleStatus,
  CouponStatus,
  type ContentRepository,
  type CouponRepository,
  type ClickEventRepository,
  type ProductComparisonRepository,
  type SyncJobLogRepository,
  Marketplace,
  type SyncJobLog,
} from '@ecommerce-amazon/domain';
import { extractProductSlugsFromBody } from '@ecommerce-amazon/shared/content';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';
import {
  mapArticle,
  mapCollection,
  mapComparison,
  mapCouponRow,
  mapCouponToRow,
  mapArticleToRow,
} from '../mappers/product.mapper.js';

export class DrizzleContentRepository implements ContentRepository {
  constructor(
    private readonly db: DrizzleClient,
    private readonly collectionRepository?: import('./drizzle-curated-collection.repository.js').DrizzleCuratedCollectionRepository,
  ) {}

  async findArticleBySlug(slug: string) {
    const rows = await this.db
      .select()
      .from(schema.contentArticles)
      .where(eq(schema.contentArticles.slug, slug));
    const row = rows[0];
    if (!row) return null;

    const embeds = await this.db
      .select()
      .from(schema.contentProductEmbeds)
      .where(eq(schema.contentProductEmbeds.articleId, row.id));

    return mapArticle(
      row,
      embeds.map((e) => ({
        productId: e.productId,
        position: e.position,
        variant: e.variant,
      })),
    );
  }

  async findArticleById(id: string) {
    const rows = await this.db
      .select()
      .from(schema.contentArticles)
      .where(eq(schema.contentArticles.id, id));
    const row = rows[0];
    if (!row) return null;

    const embeds = await this.db
      .select()
      .from(schema.contentProductEmbeds)
      .where(eq(schema.contentProductEmbeds.articleId, row.id));

    return mapArticle(
      row,
      embeds.map((e) => ({
        productId: e.productId,
        position: e.position,
        variant: e.variant,
      })),
    );
  }

  async listPublishedSummaries() {
    const rows = await this.db
      .select({
        id: schema.contentArticles.id,
        slug: schema.contentArticles.slug,
        title: schema.contentArticles.title,
      })
      .from(schema.contentArticles)
      .where(eq(schema.contentArticles.status, ArticleStatus.PUBLISHED));

    return rows;
  }

  async findRelatedPublishedByCategory(
    categoryId: string,
    excludeArticleId: string,
    limit: number,
  ) {
    const rows = await this.db
      .select({
        slug: schema.contentArticles.slug,
        title: schema.contentArticles.title,
        coverImageUrl: schema.contentArticles.coverImageUrl,
        publishedAt: schema.contentArticles.publishedAt,
      })
      .from(schema.contentArticles)
      .where(
        and(
          eq(schema.contentArticles.status, ArticleStatus.PUBLISHED),
          eq(schema.contentArticles.categoryId, categoryId),
          ne(schema.contentArticles.id, excludeArticleId),
        ),
      )
      .orderBy(desc(schema.contentArticles.publishedAt))
      .limit(limit);

    return rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      coverImageUrl: row.coverImageUrl,
      publishedAt: row.publishedAt,
    }));
  }

  async listPublishedByCategorySlug(categorySlug: string) {
    const rows = await this.db
      .select({
        slug: schema.contentArticles.slug,
        title: schema.contentArticles.title,
        coverImageUrl: schema.contentArticles.coverImageUrl,
        publishedAt: schema.contentArticles.publishedAt,
      })
      .from(schema.contentArticles)
      .innerJoin(
        schema.articleCategories,
        eq(schema.contentArticles.categoryId, schema.articleCategories.id),
      )
      .where(
        and(
          eq(schema.contentArticles.status, ArticleStatus.PUBLISHED),
          eq(schema.articleCategories.slug, categorySlug),
        ),
      )
      .orderBy(desc(schema.contentArticles.publishedAt));

    return rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      coverImageUrl: row.coverImageUrl,
      publishedAt: row.publishedAt,
    }));
  }

  private buildPublishedArticlesWhere(categorySlug?: string, search?: string) {
    const conditions = [eq(schema.contentArticles.status, ArticleStatus.PUBLISHED)];

    if (categorySlug) {
      conditions.push(eq(schema.articleCategories.slug, categorySlug));
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(schema.contentArticles.title, pattern),
          ilike(schema.contentArticles.excerpt, pattern),
        )!,
      );
    }

    return and(...conditions);
  }

  async listPublishedArticles(options: {
    categorySlug?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const whereClause = this.buildPublishedArticlesWhere(options.categorySlug, options.search);
    const offset = (options.page - 1) * options.limit;

    const [rows, totalRows] = await Promise.all([
      this.db
        .select({
          slug: schema.contentArticles.slug,
          title: schema.contentArticles.title,
          excerpt: schema.contentArticles.excerpt,
          coverImageUrl: schema.contentArticles.coverImageUrl,
          publishedAt: schema.contentArticles.publishedAt,
          categoryName: schema.articleCategories.name,
          categorySlug: schema.articleCategories.slug,
        })
        .from(schema.contentArticles)
        .leftJoin(
          schema.articleCategories,
          eq(schema.contentArticles.categoryId, schema.articleCategories.id),
        )
        .where(whereClause)
        .orderBy(desc(schema.contentArticles.publishedAt))
        .limit(options.limit)
        .offset(offset),
      this.db
        .select({ total: count() })
        .from(schema.contentArticles)
        .leftJoin(
          schema.articleCategories,
          eq(schema.contentArticles.categoryId, schema.articleCategories.id),
        )
        .where(whereClause),
    ]);

    return {
      items: rows.map((row) => ({
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        coverImageUrl: row.coverImageUrl,
        publishedAt: row.publishedAt,
        category:
          row.categoryName && row.categorySlug
            ? { name: row.categoryName, slug: row.categorySlug }
            : null,
      })),
      total: Number(totalRows[0]?.total ?? 0),
    };
  }

  async listPublishedArticleCategories() {
    const rows = await this.db
      .selectDistinct({
        name: schema.articleCategories.name,
        slug: schema.articleCategories.slug,
      })
      .from(schema.articleCategories)
      .innerJoin(
        schema.contentArticles,
        eq(schema.contentArticles.categoryId, schema.articleCategories.id),
      )
      .where(eq(schema.contentArticles.status, ArticleStatus.PUBLISHED))
      .orderBy(asc(schema.articleCategories.name));

    return rows;
  }

  async listAdminSummaries(status?: ArticleStatus) {
    const baseQuery = this.db
      .select({
        id: schema.contentArticles.id,
        slug: schema.contentArticles.slug,
        title: schema.contentArticles.title,
        excerpt: schema.contentArticles.excerpt,
        status: schema.contentArticles.status,
        coverImageUrl: schema.contentArticles.coverImageUrl,
        updatedAt: schema.contentArticles.updatedAt,
      })
      .from(schema.contentArticles);

    const rows = await (status
      ? baseQuery.where(eq(schema.contentArticles.status, status))
      : baseQuery
    ).orderBy(asc(schema.contentArticles.updatedAt));

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      status: row.status as ArticleStatus,
      coverImageUrl: row.coverImageUrl,
      updatedAt: row.updatedAt,
    }));
  }

  async saveArticle(article: import('@ecommerce-amazon/domain').ContentArticle): Promise<void> {
    const slugs = extractProductSlugsFromBody(article.body);
    const productRows =
      slugs.length > 0
        ? await this.db
            .select({ id: schema.products.id, slug: schema.products.slug })
            .from(schema.products)
            .where(inArray(schema.products.slug, slugs))
        : [];

    const slugToId = new Map(productRows.map((row) => [row.slug, row.id]));
    const embeds = slugs
      .map((slug, index) => {
        const productId = slugToId.get(slug);
        if (!productId) return null;
        return { productId, position: index + 1, variant: 'inline' as const };
      })
      .filter((embed): embed is { productId: string; position: number; variant: 'inline' } =>
        embed !== null,
      );

    await this.db.transaction(async (tx) => {
      await tx
        .insert(schema.contentArticles)
        .values(mapArticleToRow(article))
        .onConflictDoUpdate({
          target: schema.contentArticles.id,
          set: mapArticleToRow(article),
        });

      await tx
        .delete(schema.contentProductEmbeds)
        .where(eq(schema.contentProductEmbeds.articleId, article.id));

      for (const embed of embeds) {
        await tx.insert(schema.contentProductEmbeds).values({
          articleId: article.id,
          productId: embed.productId,
          position: embed.position,
          variant: embed.variant,
        });
      }
    });
  }

  async deleteArticle(id: string): Promise<void> {
    await this.db.delete(schema.contentArticles).where(eq(schema.contentArticles.id, id));
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const condition = excludeId
      ? and(eq(schema.contentArticles.slug, slug), ne(schema.contentArticles.id, excludeId))
      : eq(schema.contentArticles.slug, slug);

    const rows = await this.db
      .select({ count: count() })
      .from(schema.contentArticles)
      .where(condition);

    return (rows[0]?.count ?? 0) > 0;
  }

  async findCollectionBySlug(slug: string) {
    if (this.collectionRepository) {
      return this.collectionRepository.findBySlug(slug);
    }

    const rows = await this.db
      .select()
      .from(schema.curatedCollections)
      .where(eq(schema.curatedCollections.slug, slug));
    const row = rows[0];
    if (!row) return null;

    const products = await this.db
      .select()
      .from(schema.collectionProducts)
      .where(eq(schema.collectionProducts.collectionId, row.id));

    return mapCollection(
      row,
      products.sort((a, b) => a.sortOrder - b.sortOrder).map((p) => p.productId),
    );
  }
}

export class DrizzleCouponRepository implements CouponRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findActiveVerified() {
    const rows = await this.db
      .select()
      .from(schema.coupons)
      .where(eq(schema.coupons.status, CouponStatus.ACTIVE));
    return rows.map(mapCouponRow);
  }

  async findByMarketplace(marketplace: Marketplace) {
    const rows = await this.db
      .select()
      .from(schema.coupons)
      .where(eq(schema.coupons.marketplace, marketplace));
    return rows.map(mapCouponRow);
  }

  async findDueForVerification(limit: number) {
    const rows = await this.db.select().from(schema.coupons).limit(limit);
    return rows.map(mapCouponRow);
  }

  async save(coupon: import('@ecommerce-amazon/domain').Coupon) {
    await this.db
      .insert(schema.coupons)
      .values(mapCouponToRow(coupon))
      .onConflictDoUpdate({
        target: schema.coupons.id,
        set: mapCouponToRow(coupon),
      });
  }

  async saveBatch(coupons: import('@ecommerce-amazon/domain').Coupon[]) {
    for (const coupon of coupons) {
      await this.save(coupon);
    }
  }
}

export class DrizzleProductComparisonRepository implements ProductComparisonRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findByShareToken(token: string) {
    const rows = await this.db
      .select()
      .from(schema.productComparisons)
      .where(eq(schema.productComparisons.shareToken, token));
    const row = rows[0];
    if (!row) return null;

    const products = await this.db
      .select()
      .from(schema.comparisonProducts)
      .where(eq(schema.comparisonProducts.comparisonId, row.id));

    return mapComparison(
      row,
      products.sort((a, b) => a.sortOrder - b.sortOrder).map((p) => p.productId),
    );
  }

  async save(comparison: import('@ecommerce-amazon/domain').ProductComparison) {
    await this.db.insert(schema.productComparisons).values({
      id: comparison.id,
      shareToken: comparison.shareToken,
      sessionId: comparison.sessionId,
      editorialIntro: comparison.editorialIntro,
      createdAt: comparison.createdAt,
    });

    for (let i = 0; i < comparison.productIds.length; i++) {
      const productId = comparison.productIds[i];
      if (!productId) continue;
      await this.db.insert(schema.comparisonProducts).values({
        comparisonId: comparison.id,
        productId,
        sortOrder: i,
      });
    }
  }
}

export class DrizzleSyncJobLogRepository implements SyncJobLogRepository {
  constructor(private readonly db: DrizzleClient) {}

  async save(log: SyncJobLog): Promise<void> {
    await this.db.insert(schema.syncJobLogs).values({
      id: log.id,
      jobType: log.jobType,
      status: log.status,
      itemsProcessed: log.itemsProcessed,
      errors: log.errors,
      startedAt: log.startedAt,
      finishedAt: log.finishedAt,
    });
  }
}

export class DrizzleClickEventRepository implements ClickEventRepository {
  constructor(private readonly db: DrizzleClient) {}

  async record(event: {
    productId: string;
    origin: string;
    sessionId?: string;
    blockId?: string;
    occurredAt: Date;
  }) {
    await this.db.insert(schema.clickEvents).values({
      productId: event.productId,
      origin: event.origin,
      sessionId: event.sessionId,
      blockId: event.blockId,
      occurredAt: event.occurredAt,
    });
  }
}