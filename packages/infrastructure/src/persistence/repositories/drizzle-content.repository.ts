import { asc, and, count, desc, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm';

import {
  ArticleStatus,
  CouponStatus,
  type ContentRepository,
  type CouponRepository,
  type ClickEventRepository,
  type EngagementEventRepository,
  type ProductComparisonRepository,
  type SyncJobLogRepository,
  Marketplace,
  SyncJobLog,
  parseArticleStatus,
  parseComparisonSource,
  parseComparisonStatus,
  parseSyncJobStatus,
  parseSyncJobType,
} from '@ecommerce-amazon/domain';
import { extractAllEmbedSlugsFromBody } from '@ecommerce-amazon/shared/content';

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
        id: schema.contentArticles.id,
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
      id: row.id,
      slug: row.slug,
      title: row.title,
      coverImageUrl: row.coverImageUrl,
      publishedAt: row.publishedAt,
    }));
  }

  async listPublishedByCategorySlug(categorySlug: string) {
    const rows = await this.db
      .select({
        id: schema.contentArticles.id,
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
      id: row.id,
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
          ilike(schema.contentArticles.slug, pattern),
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
          id: schema.contentArticles.id,
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
        id: row.id,
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

  async listAdminArticles(options: {
    status?: ArticleStatus;
    search?: string;
    page: number;
    pageSize: number;
  }) {
    const whereClause = this.buildAdminArticlesWhere(options.status, options.search);
    const offset = (options.page - 1) * options.pageSize;

    const [rows, totalRows] = await Promise.all([
      this.db
        .select({
          id: schema.contentArticles.id,
          slug: schema.contentArticles.slug,
          title: schema.contentArticles.title,
          excerpt: schema.contentArticles.excerpt,
          status: schema.contentArticles.status,
          coverImageUrl: schema.contentArticles.coverImageUrl,
          updatedAt: schema.contentArticles.updatedAt,
        })
        .from(schema.contentArticles)
        .where(whereClause)
        .orderBy(desc(schema.contentArticles.updatedAt))
        .limit(options.pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(schema.contentArticles).where(whereClause),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        status: parseArticleStatus(row.status),
        coverImageUrl: row.coverImageUrl,
        updatedAt: row.updatedAt,
      })),
      total: Number(totalRows[0]?.total ?? 0),
    };
  }

  private buildAdminArticlesWhere(status?: ArticleStatus, search?: string) {
    const conditions = [];

    if (status) {
      conditions.push(eq(schema.contentArticles.status, status));
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(schema.contentArticles.title, pattern),
          ilike(schema.contentArticles.excerpt, pattern),
          ilike(schema.contentArticles.slug, pattern),
        )!,
      );
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  async saveArticle(article: import('@ecommerce-amazon/domain').ContentArticle): Promise<void> {
    const slugs = extractAllEmbedSlugsFromBody(article.body);
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
      .filter(
        (embed): embed is { productId: string; position: number; variant: 'inline' } =>
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

  private async loadComparisonWithProducts(
    row: typeof schema.productComparisons.$inferSelect,
  ): Promise<import('@ecommerce-amazon/domain').ProductComparison> {
    const products = await this.db
      .select()
      .from(schema.comparisonProducts)
      .where(eq(schema.comparisonProducts.comparisonId, row.id));

    return mapComparison(
      row,
      products.sort((a, b) => a.sortOrder - b.sortOrder).map((p) => p.productId),
    );
  }

  async findById(id: string) {
    const rows = await this.db
      .select()
      .from(schema.productComparisons)
      .where(eq(schema.productComparisons.id, id));
    const row = rows[0];
    if (!row) return null;
    return this.loadComparisonWithProducts(row);
  }

  async findByShareToken(token: string) {
    const rows = await this.db
      .select()
      .from(schema.productComparisons)
      .where(eq(schema.productComparisons.shareToken, token));
    const row = rows[0];
    if (!row) return null;
    return this.loadComparisonWithProducts(row);
  }

  async findBySlug(slug: string) {
    const rows = await this.db
      .select()
      .from(schema.productComparisons)
      .where(eq(schema.productComparisons.slug, slug));
    const row = rows[0];
    if (!row) return null;
    return this.loadComparisonWithProducts(row);
  }

  async findByProductIdSet(productIds: string[]) {
    const n = productIds.length;
    if (n === 0) return null;

    const rows = await this.db
      .select({ comparisonId: schema.comparisonProducts.comparisonId })
      .from(schema.comparisonProducts)
      .where(inArray(schema.comparisonProducts.productId, productIds))
      .groupBy(schema.comparisonProducts.comparisonId)
      .having(
        and(
          sql`count(*) = ${n}`,
          sql`count(distinct ${schema.comparisonProducts.productId}) = ${n}`,
          sql`(select count(*)::int from ${schema.comparisonProducts} cp2 where cp2.comparison_id = ${schema.comparisonProducts.comparisonId}) = ${n}`,
        ),
      )
      .limit(1);

    const comparisonId = rows[0]?.comparisonId;
    if (!comparisonId) return null;

    const comparisonRows = await this.db
      .select()
      .from(schema.productComparisons)
      .where(eq(schema.productComparisons.id, comparisonId));
    const row = comparisonRows[0];
    if (!row) return null;

    return this.loadComparisonWithProducts(row);
  }

  async listAdmin() {
    const rows = await this.db
      .select({
        id: schema.productComparisons.id,
        shareToken: schema.productComparisons.shareToken,
        slug: schema.productComparisons.slug,
        status: schema.productComparisons.status,
        source: schema.productComparisons.source,
        updatedAt: schema.productComparisons.updatedAt,
        productId: schema.comparisonProducts.productId,
        productTitle: schema.products.titleClean,
        categoryLabel: schema.categories.label,
        sortOrder: schema.comparisonProducts.sortOrder,
      })
      .from(schema.productComparisons)
      .innerJoin(
        schema.comparisonProducts,
        eq(schema.comparisonProducts.comparisonId, schema.productComparisons.id),
      )
      .innerJoin(schema.products, eq(schema.products.id, schema.comparisonProducts.productId))
      .leftJoin(schema.categories, eq(schema.categories.id, schema.products.categoryId))
      .orderBy(desc(schema.productComparisons.updatedAt), asc(schema.comparisonProducts.sortOrder));

    const byId = new Map<
      string,
      {
        id: string;
        shareToken: string;
        slug: string | null;
        status: string;
        source: string;
        updatedAt: Date;
        productTitles: string[];
        categoryLabel?: string | undefined;
      }
    >();

    for (const row of rows) {
      const existing = byId.get(row.id);
      if (existing) {
        existing.productTitles.push(row.productTitle);
        if (!existing.categoryLabel && row.categoryLabel) {
          existing.categoryLabel = row.categoryLabel;
        }
        continue;
      }
      byId.set(row.id, {
        id: row.id,
        shareToken: row.shareToken,
        slug: row.slug,
        status: row.status,
        source: row.source,
        updatedAt: row.updatedAt,
        productTitles: [row.productTitle],
        categoryLabel: row.categoryLabel ?? undefined,
      });
    }

    return [...byId.values()].map((item) => ({
      id: item.id,
      shareToken: item.shareToken,
      slug: item.slug ?? undefined,
      status: parseComparisonStatus(item.status),
      source: parseComparisonSource(item.source),
      productCount: item.productTitles.length,
      productTitles: item.productTitles,
      categoryLabel: item.categoryLabel,
      updatedAt: item.updatedAt,
    }));
  }

  async slugExists(slug: string, excludeId?: string) {
    const conditions = excludeId
      ? and(eq(schema.productComparisons.slug, slug), ne(schema.productComparisons.id, excludeId))
      : eq(schema.productComparisons.slug, slug);
    const rows = await this.db
      .select({ id: schema.productComparisons.id })
      .from(schema.productComparisons)
      .where(conditions)
      .limit(1);
    return rows.length > 0;
  }

  async save(comparison: import('@ecommerce-amazon/domain').ProductComparison) {
    await this.db.insert(schema.productComparisons).values({
      id: comparison.id,
      shareToken: comparison.shareToken,
      sessionId: comparison.sessionId,
      editorialIntro: comparison.editorialIntro,
      slug: comparison.slug ?? null,
      status: comparison.status,
      source: comparison.source,
      seoTitle: comparison.seoTitle ?? null,
      seoDescription: comparison.seoDescription ?? null,
      showCategoryCarousel: comparison.showCategoryCarousel,
      createdAt: comparison.createdAt,
      updatedAt: comparison.updatedAt,
      publishedAt: comparison.publishedAt ?? null,
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

  async update(comparison: import('@ecommerce-amazon/domain').ProductComparison) {
    await this.db
      .update(schema.productComparisons)
      .set({
        editorialIntro: comparison.editorialIntro,
        slug: comparison.slug ?? null,
        status: comparison.status,
        source: comparison.source,
        seoTitle: comparison.seoTitle ?? null,
        seoDescription: comparison.seoDescription ?? null,
        showCategoryCarousel: comparison.showCategoryCarousel,
        updatedAt: comparison.updatedAt,
        publishedAt: comparison.publishedAt ?? null,
      })
      .where(eq(schema.productComparisons.id, comparison.id));

    await this.db
      .delete(schema.comparisonProducts)
      .where(eq(schema.comparisonProducts.comparisonId, comparison.id));

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

  async delete(id: string) {
    await this.db.delete(schema.productComparisons).where(eq(schema.productComparisons.id, id));
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

  async findRecent(input: { limit: number; status?: string }): Promise<SyncJobLog[]> {
    const conditions = input.status
      ? [eq(schema.syncJobLogs.status, parseSyncJobStatus(input.status))]
      : [];

    const rows = await this.db
      .select()
      .from(schema.syncJobLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.syncJobLogs.startedAt))
      .limit(input.limit);

    return rows.map(
      (row) =>
        new SyncJobLog(
          row.id,
          parseSyncJobType(row.jobType),
          parseSyncJobStatus(row.status),
          row.itemsProcessed,
          row.errors,
          row.startedAt,
          row.finishedAt ?? undefined,
        ),
    );
  }
}

export class DrizzleClickEventRepository implements ClickEventRepository {
  constructor(private readonly db: DrizzleClient) {}

  async record(event: {
    productId: string;
    origin: string;
    sessionId?: string;
    blockId?: string;
    articleId?: string;
    collectionId?: string;
    placement?: string;
    pagePath?: string;
    referrerPath?: string;
    occurredAt: Date;
  }) {
    await this.recordBatch([event]);
  }

  async recordBatch(
    events: Array<{
      productId: string;
      origin: string;
      sessionId?: string;
      blockId?: string;
      articleId?: string;
      collectionId?: string;
      placement?: string;
      pagePath?: string;
      referrerPath?: string;
      occurredAt: Date;
    }>,
  ) {
    if (events.length === 0) return;
    await this.db.insert(schema.clickEvents).values(
      events.map((event) => ({
        productId: event.productId,
        origin: event.origin,
        sessionId: event.sessionId,
        blockId: event.blockId,
        articleId: event.articleId,
        collectionId: event.collectionId,
        placement: event.placement,
        pagePath: event.pagePath,
        referrerPath: event.referrerPath,
        occurredAt: event.occurredAt,
      })),
    );
  }
}

export class DrizzleEngagementEventRepository implements EngagementEventRepository {
  constructor(private readonly db: DrizzleClient) {}

  async record(event: {
    eventType: string;
    articleId: string;
    pagePath: string;
    placement?: string;
    blockId?: string;
    referrerPath?: string;
    sessionId?: string;
    occurredAt: Date;
  }) {
    await this.recordBatch([event]);
  }

  async recordBatch(
    events: Array<{
      eventType: string;
      articleId: string;
      pagePath: string;
      placement?: string;
      blockId?: string;
      referrerPath?: string;
      sessionId?: string;
      occurredAt: Date;
    }>,
  ) {
    if (events.length === 0) return;
    await this.db.insert(schema.contentEngagementEvents).values(
      events.map((event) => ({
        eventType: event.eventType,
        articleId: event.articleId,
        pagePath: event.pagePath,
        placement: event.placement,
        blockId: event.blockId,
        referrerPath: event.referrerPath,
        sessionId: event.sessionId,
        occurredAt: event.occurredAt,
      })),
    );
  }
}
