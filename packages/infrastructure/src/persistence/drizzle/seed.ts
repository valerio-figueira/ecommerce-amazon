import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  AffiliateAccountStatus,
  ArticleStatus,
  ArticleType,
  BlockType,
  CouponStatus,
  DiscountType,
  Marketplace,
  PageStatus,
  ProductAvailability,
} from '@ecommerce-amazon/domain';
import { createConsoleLogger, loadEnv } from '@ecommerce-amazon/shared';

import { schema } from '../drizzle/client.js';
import { loadDotenvFromMonorepoRoot } from './load-env.js';
import { insertPageWithBlocks } from '../repositories/drizzle-page.repository.js';
import { BcryptPasswordHasher } from '../../auth/bcrypt-password.hasher.js';

const SEED_PRODUCT_AMAZON_ID = 'a1111111-1111-4111-8111-111111111111';
const SEED_PRODUCT_SHOPEE_ID = 'a2222222-2222-4222-8222-222222222222';
const SEED_ARTICLE_ID = 'b1111111-1111-4111-8111-111111111111';
const SEED_COLLECTION_ID = 'c1111111-1111-4111-8111-111111111111';
const SEED_COUPON_ID = 'd1111111-1111-4111-8111-111111111111';
const SEED_AFFILIATE_AMAZON_ID = 'e1111111-1111-4111-8111-111111111111';
const SEED_AFFILIATE_SHOPEE_ID = 'e2222222-2222-4222-8222-222222222222';
const SEED_PAGE_HOME_ID = 'f1111111-1111-4111-8111-111111111111';
const SEED_BLOCK_HERO_SPLIT_ID = 'f2111111-1111-4111-8111-111111111111';
const SEED_BLOCK_HERO_CAROUSEL_ID = 'f3111111-1111-4111-8111-111111111111';
const SEED_BLOCK_FEATURED_ID = 'f4111111-1111-4111-8111-111111111111';
const SEED_BLOCK_PILLS_ID = 'f5111111-1111-4111-8111-111111111111';
const SEED_BLOCK_BENTO_ID = 'f8111111-1111-4111-8111-111111111111';
const SEED_BLOCK_GRID_ID = 'f6111111-1111-4111-8111-111111111111';
const SEED_BLOCK_DYNAMIC_GRID_ID = 'f7111111-1111-4111-8111-111111111111';
const SEED_OPERATOR_ID = '90111111-1111-4111-8111-111111111111';

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
      logger.info('Product seed data already present, skipping products');
    } else {
      logger.info('Inserting development seed data');
      await insertProductSeed(db, now);
    }

    await seedHomePage(db, now, logger);
    await seedOperator(db, logger);
  } finally {
    await sql.end();
  }
}

async function insertProductSeed(
  db: ReturnType<typeof drizzle<typeof schema>>,
  now: Date,
): Promise<void> {
  const env = loadEnv();

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
        canonicalUrl: 'https://vitrine.local/p/cadeira-ergonomica-home-office',
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
}

async function seedHomePage(
  db: ReturnType<typeof drizzle<typeof schema>>,
  now: Date,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const existingPage = await db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(eq(schema.pages.slug, 'home'))
    .limit(1);

  if (existingPage.length > 0) {
    logger.info('Home page seed already present, skipping');
    return;
  }

  await insertPageWithBlocks(
    db,
    {
      id: SEED_PAGE_HOME_ID,
      slug: 'home',
      title: 'Vitrine',
      status: PageStatus.PUBLISHED,
      seoTitle: 'Vitrine — Curadoria inteligente de produtos',
      seoDescription: 'Descubra ofertas selecionadas com histórico de preços e alertas.',
      publishedAt: now,
      updatedAt: now,
    },
    [
      {
        id: SEED_BLOCK_HERO_CAROUSEL_ID,
        type: BlockType.HERO_CAROUSEL,
        sortOrder: 1,
        props: {
          slides: [
            {
              imageUrl: 'https://placehold.co/1200x800?text=Setup+Gamer',
              title: 'Monte seu setup gamer completo',
              subtitle: 'Seleção curada com os melhores custo-benefício',
              ctaLabel: 'Ver coleção',
              ctaHref: '/c/setup-gamer-iniciante',
            },
            {
              imageUrl: 'https://placehold.co/1200x800?text=Home+Office',
              title: 'Home office ergonômico',
              subtitle: 'Produtos testados pela nossa curadoria',
              ctaLabel: 'Explorar',
              linkedProductSlug: 'cadeira-ergonomica-home-office',
            },
          ],
          autoplay: true,
          intervalMs: 6000,
        },
      },
      {
        id: SEED_BLOCK_FEATURED_ID,
        type: BlockType.FEATURED_PRODUCT,
        sortOrder: 2,
        props: {
          productSlug: 'cadeira-ergonomica-home-office',
          showMarketplaceBadge: true,
          ctaLabel: 'Ver na Amazon',
        },
      },
      {
        id: SEED_BLOCK_HERO_SPLIT_ID,
        type: BlockType.HERO_SPLIT,
        sortOrder: 0,
        props: {
          ratio: '2/1',
          leftBlockId: SEED_BLOCK_HERO_CAROUSEL_ID,
          rightBlockId: SEED_BLOCK_FEATURED_ID,
        },
      },
      {
        id: SEED_BLOCK_BENTO_ID,
        type: BlockType.CATEGORY_BENTO_GRID,
        sortOrder: 3,
        props: {
          title: 'Categorias populares',
          tiles: [
            {
              title: 'Home office',
              subtitle: 'Curadoria ergonômica',
              imageUrl: 'https://placehold.co/400x400?text=Office',
              size: 'large',
              categorySlug: 'home-office',
            },
            {
              title: 'Games',
              subtitle: 'Setup gamer',
              imageUrl: 'https://placehold.co/300x300?text=Games',
              size: 'small',
              categorySlug: 'games',
            },
            {
              title: 'Eletrônicos',
              subtitle: 'Tech selecionada',
              imageUrl: 'https://placehold.co/300x300?text=Tech',
              size: 'small',
              categorySlug: 'eletronicos',
            },
            {
              title: 'Ergonomia',
              subtitle: 'Conforto no dia a dia',
              imageUrl: 'https://placehold.co/300x300?text=Ergo',
              size: 'small',
              categorySlug: 'home-office',
            },
            {
              title: 'Periféricos',
              subtitle: 'Mouse, teclado e mais',
              imageUrl: 'https://placehold.co/300x300?text=Perif',
              size: 'small',
              categorySlug: 'games',
            },
            {
              title: 'Destaques',
              subtitle: 'Seleção editorial',
              imageUrl: 'https://placehold.co/400x400?text=Top',
              size: 'large',
              href: '/c/setup-gamer-iniciante',
            },
          ],
        },
      },
      {
        id: SEED_BLOCK_PILLS_ID,
        type: BlockType.CATEGORY_PILLS,
        sortOrder: 4,
        props: {
          categorySlugs: ['home-office', 'games', 'eletronicos'],
          linkedBlockId: SEED_BLOCK_GRID_ID,
        },
      },
      {
        id: SEED_BLOCK_GRID_ID,
        type: BlockType.PRODUCT_GRID,
        sortOrder: 5,
        props: {
          title: 'Produtos populares',
          categorySlug: null,
          sort: 'editorial_score',
          pageSize: 12,
          columns: 4,
        },
      },
      {
        id: SEED_BLOCK_DYNAMIC_GRID_ID,
        type: BlockType.DYNAMIC_PRODUCT_GRID,
        sortOrder: 6,
        props: {
          title: 'Ofertas home office',
          subtitle: 'Seleção dinâmica por curadoria',
          categoryVertical: 'home-office',
          minDiscountPercentage: 10,
          sortBy: 'editorial_score',
          limit: 8,
        },
      },
    ],
  );

  logger.info('Home page CMS seed inserted');
}

async function seedOperator(
  db: ReturnType<typeof drizzle<typeof schema>>,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const env = loadEnv();
  const existing = await db
    .select({ id: schema.operators.id })
    .from(schema.operators)
    .where(eq(schema.operators.id, SEED_OPERATOR_ID))
    .limit(1);

  if (existing.length > 0) {
    logger.info('Operator seed data already present, skipping operator');
    return;
  }

  const passwordHasher = new BcryptPasswordHasher();
  const passwordHash = await passwordHasher.hash(env.ADMIN_SEED_PASSWORD);

  await db.insert(schema.operators).values({
    id: SEED_OPERATOR_ID,
    email: env.ADMIN_SEED_EMAIL.toLowerCase(),
    passwordHash,
    name: 'Administrador Vitrine',
    status: 'active',
  });

  logger.info('Operator seed inserted', { email: env.ADMIN_SEED_EMAIL });
}

runSeed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Seed failed:', message);
  process.exit(1);
});
