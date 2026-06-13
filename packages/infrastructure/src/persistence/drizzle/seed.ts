import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  AffiliateAccountStatus,
  ArticleStatus,
  ArticleType,
  CouponStatus,
  DiscountType,
  Marketplace,
  ProductAvailability,
} from '@ecommerce-amazon/domain';
import { createConsoleLogger, loadEnv } from '@ecommerce-amazon/shared';

import { schema } from '../drizzle/client.js';
import { loadDotenvFromMonorepoRoot } from './load-env.js';

const SEED_PRODUCT_AMAZON_ID = 'a1111111-1111-4111-8111-111111111111';
const SEED_PRODUCT_SHOPEE_ID = 'a2222222-2222-4222-8222-222222222222';
const SEED_ARTICLE_ID = 'b1111111-1111-4111-8111-111111111111';
const SEED_COLLECTION_ID = 'c1111111-1111-4111-8111-111111111111';
const SEED_COUPON_ID = 'd1111111-1111-4111-8111-111111111111';
const SEED_AFFILIATE_AMAZON_ID = 'e1111111-1111-4111-8111-111111111111';
const SEED_AFFILIATE_SHOPEE_ID = 'e2222222-2222-4222-8222-222222222222';

async function runSeed(): Promise<void> {
  loadDotenvFromMonorepoRoot();

  const logger = createConsoleLogger();
  const env = loadEnv();

  if (env.NODE_ENV === 'production' && !env.SEED_FORCE) {
    logger.warn('Skipping seed in production (set SEED_FORCE=true to override)');
    return;
  }

  const sql = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql, { schema });
  const now = new Date();

  try {
    const existing = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.id, SEED_PRODUCT_AMAZON_ID))
      .limit(1);

    if (existing.length > 0) {
      logger.info('Seed data already present, skipping');
      return;
    }

    logger.info('Inserting development seed data');

    await db.insert(schema.affiliateAccounts).values([
      {
        id: SEED_AFFILIATE_AMAZON_ID,
        marketplace: Marketplace.AMAZON_BR,
        affiliateTag: env.AMAZON_AFFILIATE_TAG || 'vitrine-21',
        status: AffiliateAccountStatus.ACTIVE,
        validatedBy: 'seed',
        validatedAt: now,
      },
      {
        id: SEED_AFFILIATE_SHOPEE_ID,
        marketplace: Marketplace.SHOPEE_BR,
        affiliateTag: env.SHOPEE_AFFILIATE_ID || 'vitrine-shopee',
        status: AffiliateAccountStatus.PENDING,
      },
    ]);

    await db.insert(schema.products).values([
      {
        id: SEED_PRODUCT_AMAZON_ID,
        marketplace: Marketplace.AMAZON_BR,
        externalId: 'B0SEED001',
        slug: 'cadeira-ergonomica-home-office',
        titleClean: 'Cadeira Ergonômica Home Office',
        titleRaw: 'Cadeira Ergonômica Home Office Pro',
        shortDescription: 'Cadeira com apoio lombar ajustável para longas jornadas.',
        priceAmount: '899.90',
        priceStrikethrough: '1099.90',
        currency: 'BRL',
        stalePrice: false,
        priceUpdatedAt: now,
        affiliateDeepLink: 'https://www.amazon.com.br/dp/B0SEED001',
        images: ['https://placehold.co/600x600?text=Cadeira'],
        specsNormalized: { material: 'Mesh', peso_maximo: '120kg' },
        editorialScore: 85,
        availability: ProductAvailability.IN_STOCK,
        rating: '4.60',
        reviewCount: 128,
        categoryVertical: 'home-office',
        tags: ['ergonomica', 'home-office'],
        metaTitle: 'Cadeira Ergonômica Home Office | Vitrine',
        metaDescription: 'Compare preço e histórico da cadeira ergonômica mais buscada.',
        pros: ['Apoio lombar', 'Braços ajustáveis'],
        cons: ['Montagem demorada'],
        createdAt: now,
      },
      {
        id: SEED_PRODUCT_SHOPEE_ID,
        marketplace: Marketplace.SHOPEE_BR,
        externalId: 'SHOPEE-SEED-002',
        slug: 'headset-gamer-7-1',
        titleClean: 'Headset Gamer 7.1 Surround',
        titleRaw: 'Headset Gamer 7.1 RGB USB',
        shortDescription: 'Headset com som surround virtual e microfone removível.',
        priceAmount: '249.90',
        currency: 'BRL',
        stalePrice: false,
        priceUpdatedAt: now,
        affiliateDeepLink: 'https://shopee.com.br/headset-gamer-seed',
        images: ['https://placehold.co/600x600?text=Headset'],
        specsNormalized: { conexao: 'USB', surround: '7.1' },
        editorialScore: 78,
        availability: ProductAvailability.IN_STOCK,
        rating: '4.40',
        reviewCount: 56,
        categoryVertical: 'games',
        tags: ['headset', 'gamer'],
        createdAt: now,
      },
    ]);

    const snapshots = [];
    for (let day = 30; day >= 0; day -= 3) {
      const capturedAt = new Date(now);
      capturedAt.setDate(capturedAt.getDate() - day);
      const amount = (899.9 - (30 - day) * 5).toFixed(2);
      snapshots.push({
        productId: SEED_PRODUCT_AMAZON_ID,
        amount,
        currency: 'BRL',
        source: 'worker_cron' as const,
        capturedAt,
      });
    }
    await db.insert(schema.priceSnapshots).values(snapshots);

    await db.insert(schema.contentArticles).values({
      id: SEED_ARTICLE_ID,
      slug: 'guia-cadeira-ergonomica',
      title: 'Guia completo: como escolher cadeira ergonômica',
      body: '<p>Conteúdo editorial com embed dinâmico de produto abaixo.</p>',
      type: ArticleType.GUIDE,
      status: ArticleStatus.PUBLISHED,
      seo: {
        title: 'Guia de cadeira ergonômica',
        description: 'Aprenda a escolher a cadeira ideal para home office.',
      },
      publishedAt: now,
    });

    await db.insert(schema.contentProductEmbeds).values({
      articleId: SEED_ARTICLE_ID,
      productId: SEED_PRODUCT_AMAZON_ID,
      position: 1,
      variant: 'highlight',
    });

    await db.insert(schema.curatedCollections).values({
      id: SEED_COLLECTION_ID,
      slug: 'setup-gamer-iniciante',
      title: 'Setup gamer para iniciantes',
      description: 'Seleção curada para montar seu primeiro setup.',
      coverImageUrl: 'https://placehold.co/1200x630?text=Setup+Gamer',
      campaignOrigin: 'pinterest',
      utmDefaults: { utm_source: 'pinterest', utm_medium: 'social', utm_campaign: 'setup-gamer' },
      ctaText: 'Ver ofertas do setup',
    });

    await db.insert(schema.collectionProducts).values([
      { collectionId: SEED_COLLECTION_ID, productId: SEED_PRODUCT_SHOPEE_ID, sortOrder: 0 },
      { collectionId: SEED_COLLECTION_ID, productId: SEED_PRODUCT_AMAZON_ID, sortOrder: 1 },
    ]);

    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + 30);

    await db.insert(schema.coupons).values({
      id: SEED_COUPON_ID,
      marketplace: Marketplace.AMAZON_BR,
      code: 'VITRINE10',
      description: '10% off em seleção home office',
      discountValue: '10.00',
      discountType: DiscountType.PERCENT,
      validFrom: now,
      validUntil,
      status: CouponStatus.ACTIVE,
      sourceUrl: 'https://www.amazon.com.br/deals',
      lastVerifiedAt: now,
    });

    logger.info('Seed data inserted successfully');
  } finally {
    await sql.end();
  }
}

runSeed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Seed failed:', message);
  process.exit(1);
});
