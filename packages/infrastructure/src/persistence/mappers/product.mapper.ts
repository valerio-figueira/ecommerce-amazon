import {
  AffiliateLink,
  ContentArticle,
  Coupon,
  CuratedCollection,
  Email,
  parseAlertStatus,
  parseArticleStatus,
  parseArticleType,
  parseComparisonSource,
  parseComparisonStatus,
  parseContentEmbedVariant,
  parseCouponStatus,
  parseCurrency,
  parseDiscountType,
  parseMarketplace,
  parseProductAvailability,
  parseSnapshotSource,
  Price,
  PriceAlert,
  PriceSnapshot,
  Product,
  ProductComparison,
  toProductId,
  WishlistItem,
} from '@ecommerce-amazon/domain';

import { parseSpecsNormalizedFromDb } from '@ecommerce-amazon/shared/product';

import type { schema } from '../drizzle/client.js';

type ProductRow = typeof schema.products.$inferSelect;

export function mapProductRowToDomain(row: ProductRow): Product {
  return Product.create({
    id: row.id,
    marketplace: parseMarketplace(row.marketplace),
    externalId: row.externalId,
    slug: row.slug,
    titleClean: row.titleClean,
    titleRaw: row.titleRaw,
    shortDescription: row.shortDescription ?? undefined,
    longDescriptionHtml: row.longDescriptionHtml ?? undefined,
    price: Price.create({
      amount: Number(row.priceAmount),
      currency: parseCurrency(row.currency),
      updatedAt: row.priceUpdatedAt,
      isStale: row.stalePrice,
    }),
    strikethroughPrice: row.priceStrikethrough ? Number(row.priceStrikethrough) : undefined,
    affiliateLink: AffiliateLink.create(row.affiliateDeepLink, row.marketplace),
    images: row.images,
    specsNormalized: parseSpecsNormalizedFromDb(row.specsNormalized),
    editorialScore: row.editorialScore,
    availability: parseProductAvailability(row.availability),
    rating: row.rating ? Number(row.rating) : undefined,
    reviewCount: row.reviewCount ?? undefined,
    categoryId: row.categoryId ?? undefined,
    tags: row.tags,
    metaTitle: row.metaTitle ?? undefined,
    metaDescription: row.metaDescription ?? undefined,
    canonicalUrl: row.canonicalUrl ?? undefined,
    pros: row.pros ?? undefined,
    cons: row.cons ?? undefined,
    visible: row.visible,
    createdAt: row.createdAt,
  });
}

export function mapProductToRow(product: Product): typeof schema.products.$inferInsert {
  return {
    id: product.id,
    marketplace: product.marketplace,
    externalId: product.externalId,
    slug: product.slug,
    titleClean: product.titleClean,
    titleRaw: product.titleRaw,
    shortDescription: product.shortDescription,
    longDescriptionHtml: product.longDescriptionHtml,
    priceAmount: String(product.price.amount),
    priceStrikethrough: product.strikethroughPrice ? String(product.strikethroughPrice) : undefined,
    currency: product.price.currency,
    stalePrice: product.price.isStale,
    priceUpdatedAt: product.price.updatedAt,
    affiliateDeepLink: product.affiliateLink.url,
    images: product.images,
    specsNormalized: product.specsNormalized,
    editorialScore: product.editorialScore,
    availability: product.availability,
    rating: product.rating ? String(product.rating) : undefined,
    reviewCount: product.reviewCount,
    categoryId: product.categoryId,
    tags: product.tags,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    canonicalUrl: product.canonicalUrl,
    pros: product.pros,
    cons: product.cons,
    visible: product.visible,
    createdAt: product.createdAt,
  };
}

export function mapPriceAlertRow(row: typeof schema.priceAlerts.$inferSelect): PriceAlert {
  return new PriceAlert(
    row.id,
    toProductId(row.productId),
    Email.create(row.email),
    Number(row.targetPrice),
    parseAlertStatus(row.status),
    row.confirmToken,
    row.createdAt,
    row.triggeredAt ?? undefined,
  );
}

export function mapPriceAlertToRow(alert: PriceAlert): typeof schema.priceAlerts.$inferInsert {
  return {
    id: alert.id,
    productId: alert.productId,
    email: alert.email.value,
    targetPrice: String(alert.targetPrice),
    status: alert.status,
    confirmToken: alert.confirmToken,
    createdAt: alert.createdAt,
    triggeredAt: alert.triggeredAt,
  };
}

export function mapSnapshotRow(row: typeof schema.priceSnapshots.$inferSelect): PriceSnapshot {
  return PriceSnapshot.create({
    id: row.id,
    productId: row.productId,
    amount: Number(row.amount),
    currency: parseCurrency(row.currency),
    source: parseSnapshotSource(row.source),
    capturedAt: row.capturedAt,
  });
}

export function mapWishlistRow(row: typeof schema.wishlistItems.$inferSelect): WishlistItem {
  return WishlistItem.create({
    id: row.id,
    sessionId: row.sessionId,
    productId: row.productId,
    marketplace: parseMarketplace(row.marketplace),
    sortOrder: row.sortOrder,
    addedAt: row.addedAt,
  });
}

export function mapCouponRow(row: typeof schema.coupons.$inferSelect): Coupon {
  return new Coupon(
    row.id,
    parseMarketplace(row.marketplace),
    row.code,
    row.description,
    Number(row.discountValue),
    parseDiscountType(row.discountType),
    row.validFrom,
    row.validUntil,
    parseCouponStatus(row.status),
    row.sourceUrl,
    row.lastVerifiedAt,
  );
}

export function mapCouponToRow(coupon: Coupon): typeof schema.coupons.$inferInsert {
  return {
    id: coupon.id,
    marketplace: coupon.marketplace,
    code: coupon.code,
    description: coupon.description,
    discountValue: String(coupon.discountValue),
    discountType: coupon.discountType,
    validFrom: coupon.validFrom,
    validUntil: coupon.validUntil,
    status: coupon.status,
    sourceUrl: coupon.sourceUrl,
    lastVerifiedAt: coupon.lastVerifiedAt,
  };
}

export function mapArticle(
  row: typeof schema.contentArticles.$inferSelect,
  embeds: { productId: string; position: number; variant: string }[],
): ContentArticle {
  return ContentArticle.create({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.coverImageUrl,
    body: row.body,
    type: parseArticleType(row.type),
    status: parseArticleStatus(row.status),
    authorId: row.authorId,
    categoryId: row.categoryId,
    clusterId: row.clusterId,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    seo: row.seo,
    embeds: embeds.map((e) => ({
      productId: e.productId,
      position: e.position,
      variant: parseContentEmbedVariant(e.variant),
    })),
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function mapArticleToRow(article: ContentArticle) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImageUrl,
    body: article.body,
    type: article.type,
    status: article.status,
    authorId: article.authorId,
    categoryId: article.categoryId,
    clusterId: article.clusterId,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    seo: article.seo,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

export function mapCollection(
  row: typeof schema.curatedCollections.$inferSelect,
  productIds: string[],
): CuratedCollection {
  return CuratedCollection.create({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverImageUrl: row.coverImageUrl,
    campaignOrigin: row.campaignOrigin,
    utmDefaults: row.utmDefaults,
    productIds,
    ctaText: row.ctaText,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function mapCollectionToRow(collection: CuratedCollection) {
  return {
    id: collection.id,
    slug: collection.slug,
    title: collection.title,
    description: collection.description,
    coverImageUrl: collection.coverImageUrl,
    campaignOrigin: collection.campaignOrigin,
    utmDefaults: collection.utmDefaults,
    ctaText: collection.ctaText,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
}

export function mapComparison(
  row: typeof schema.productComparisons.$inferSelect,
  productIds: string[],
): ProductComparison {
  return ProductComparison.create({
    id: row.id,
    shareToken: row.shareToken,
    sessionId: row.sessionId,
    productIds,
    editorialIntro: row.editorialIntro,
    createdAt: row.createdAt,
    status: parseComparisonStatus(row.status),
    source: parseComparisonSource(row.source),
    updatedAt: row.updatedAt,
    slug: row.slug ?? undefined,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    showCategoryCarousel: row.showCategoryCarousel,
    publishedAt: row.publishedAt ?? undefined,
  });
}
