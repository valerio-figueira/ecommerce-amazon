import { and, eq, inArray, sql } from 'drizzle-orm';
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
  PageKind,
  PageStatus,
  ProductAvailability,
  TeamPublicRole,
  parseBlockType,
} from '@ecommerce-amazon/domain';
import { createConsoleLogger, loadEnv } from '@ecommerce-amazon/shared';
import { buildDefaultAboutPageContent } from '@ecommerce-amazon/shared/about';
import { DEFAULT_SITE_SETTINGS } from '@ecommerce-amazon/shared/admin';
import { heroCarouselPropsSchema } from '@ecommerce-amazon/shared/cms';
import {
  formatWebHomeTitle,
  formatWebPageTitle,
  getBrandConfig,
} from '@ecommerce-amazon/shared/config/brand';
import { legacyRecordToSpecGroups } from '@ecommerce-amazon/shared/product';
import { SEO_KEYWORD_MAP } from '@ecommerce-amazon/shared/seo';

import { schema } from '../drizzle/client.js';
import { loadDotenvFromMonorepoRoot } from './load-env.js';
import { insertPageWithBlocks } from '../repositories/drizzle-page.repository.js';
import { SITE_SETTINGS_ROW_ID } from '../repositories/drizzle-site-settings.repository.js';
import { BcryptPasswordHasher } from '../../auth/bcrypt-password.hasher.js';

const SEED_PRODUCT_AMAZON_ID = 'a1111111-1111-4111-8111-111111111111';
const SEED_PRODUCT_SHOPEE_ID = 'a2222222-2222-4222-8222-222222222222';
const SEED_PRODUCT_TECLADO_ID = 'a3333333-3333-4333-8333-333333333333';
const SEED_PRODUCT_MOUSE_ID = 'a4444444-4444-4444-8444-444444444444';
const SEED_ARTICLE_ID = 'b1111111-1111-4111-8111-111111111111';
const SEED_ARTICLE_SPOKE_1_ID = 'b2222222-2222-4222-8222-222222222222';
const SEED_ARTICLE_SPOKE_2_ID = 'b3333333-3333-4333-8333-333333333333';
const SEED_CONTENT_CLUSTER_ID = 'cc111111-1111-4111-8111-111111111111';
const SEED_COLLECTION_ID = 'c1111111-1111-4111-8111-111111111111';
const SEED_COLLECTION_HOME_OFFICE_ID = 'c2222222-2222-4222-8222-222222222222';
const SEED_COLLECTION_PERIFERICOS_ID = 'c3333333-3333-4333-8333-333333333333';
const SEED_COUPON_ID = 'd1111111-1111-4111-8111-111111111111';
const SEED_AFFILIATE_AMAZON_ID = 'e1111111-1111-4111-8111-111111111111';
const SEED_AFFILIATE_SHOPEE_ID = 'e2222222-2222-4222-8222-222222222222';
const SEED_PAGE_HOME_ID = 'f1111111-1111-4111-8111-111111111111';
const SEED_PAGE_SOBRE_ID = 'f2222222-2222-4222-8222-222222222222';
const SEED_BLOCK_HERO_CAROUSEL_ID = 'f3111111-1111-4111-8111-111111111111';
const SEED_BLOCK_PILLS_ID = 'f5111111-1111-4111-8111-111111111111';
const SEED_BLOCK_BENTO_ID = 'f8111111-1111-4111-8111-111111111111';
const SEED_BLOCK_GRID_ID = 'f6111111-1111-4111-8111-111111111111';
const SEED_BLOCK_DYNAMIC_GRID_ID = 'f7111111-1111-4111-8111-111111111111';
const SEED_BLOCK_COLLECTION_ID = 'f9111111-1111-4111-8111-111111111111';
const SEED_BLOCK_BENTO_HUB_MIX_ID = 'fa111111-1111-4111-8111-111111111111';
const SEED_OPERATOR_ID = '90111111-1111-4111-8111-111111111111';
const SEED_ARTICLE_CATEGORY_GUIAS_ID = 'ac111111-1111-4111-8111-111111111111';
const SEED_ARTICLE_CATEGORY_REVIEWS_ID = 'ac222222-2222-4222-8222-222222222222';
const SEED_ARTICLE_CATEGORY_COMPARATIVOS_ID = 'ac333333-3333-4333-8333-333333333333';

const BENTO_HUB_MIX_BLOCK_PROPS = {
  slot1: {
    contentType: 'collection',
    entityId: SEED_COLLECTION_ID,
    title: 'Setup gamer para começar',
    subtitle: 'Coleção curada com os melhores custo-benefício',
  },
  slot2: {
    productId: SEED_PRODUCT_SHOPEE_ID,
  },
  slot3: {
    contentType: 'category',
    categorySlug: 'games',
    listTitle: 'Top Games',
  },
} as const;

const FLASH_DEALS_BLOCK_PROPS = {
  title: 'Ofertas Relâmpago',
  subtitle: 'Maiores descontos detectados nas últimas horas — confira antes que o preço suba',
  minDiscountPercentage: 30,
  sortBy: 'discount_percent_desc',
  limit: 12,
} as const;
const SEED_CATEGORY_HOME_OFFICE_ID = 'a0111111-1111-4111-8111-111111111111';
const SEED_CATEGORY_GAMES_ID = 'a0222222-2222-4222-8222-222222222222';
const SEED_CATEGORY_ELETRONICOS_ID = 'a0333333-3333-4333-8333-333333333333';
const SEED_CATEGORY_PERIFERICOS_ID = 'a0444444-4444-4444-8444-444444444444';
const SEED_CATEGORY_TECLADOS_ID = 'a0555555-5555-4555-8555-555555555555';

const PEXELS = {
  gamingCover:
    'https://images.pexels.com/photos/7775642/pexels-photo-7775642.jpeg?auto=compress&cs=tinysrgb&w=1200',
  homeOfficeCover:
    'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=1200',
  peripheralsCover:
    'https://images.pexels.com/photos/4523952/pexels-photo-4523952.jpeg?auto=compress&cs=tinysrgb&w=1200',
  chair:
    'https://images.pexels.com/photos/1957482/pexels-photo-1957482.jpeg?auto=compress&cs=tinysrgb&w=800',
  headset:
    'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=800',
  keyboard:
    'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800',
  mouse:
    'https://images.pexels.com/photos/399161/pexels-photo-399161.jpeg?auto=compress&cs=tinysrgb&w=800',
  authorAvatar:
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
} as const;

async function runSeed(): Promise<void> {
  if (process.env['NODE_ENV'] !== 'production') {
    loadDotenvFromMonorepoRoot();
  }

  const logger = createConsoleLogger();
  const env = loadEnv();

  if (env.NODE_ENV === 'production' && !env.SEED_FORCE) {
    logger.warn('Skipping seed in production (set SEED_FORCE=true to override)');
    return;
  }

  const devSeed = env.NODE_ENV !== 'production';

  const sql = postgres(env.DATABASE_URL, { max: 1, onnotice: () => {} });
  const db = drizzle(sql, { schema });
  const now = new Date();

  try {
    logger.info(
      devSeed
        ? 'Running development seed (with demo catalog)'
        : 'Running production bootstrap seed',
    );

    await seedArticleCategories(db, now, logger);

    if (devSeed) {
      await seedCategories(db, now, logger);

      const existing = await db
        .select({ id: schema.products.id })
        .from(schema.products)
        .where(eq(schema.products.id, SEED_PRODUCT_AMAZON_ID))
        .limit(1);

      if (existing.length > 0) {
        logger.info('Product seed data already present, skipping products');
      } else {
        logger.info('Inserting development demo catalog');
        await insertProductSeed(db, now);
      }
    }

    await seedHomePage(db, now, logger, devSeed);

    if (devSeed) {
      await ensureFlashDealsHomeLayout(db, logger);
      await seedCollections(db, now, logger);
      await ensureBentoHubMixHomeBlock(db, logger);
      await ensureCuratedCollectionHomeBlock(db, logger);
    }

    await seedOperator(db, logger, devSeed, env);
    await seedSiteSettings(db, logger);
    await seedAboutPage(db, now, logger);
    await seedAutoLinks(db, logger);

    if (devSeed) {
      await seedContentClusters(db, now, logger);
    } else {
      await refreshProductionBrandContent(db, now, logger);
    }
  } finally {
    await sql.end();
  }
}

async function insertProductSeed(
  db: ReturnType<typeof drizzle<typeof schema>>,
  now: Date,
): Promise<void> {
  const env = loadEnv();
  const brand = getBrandConfig(env);

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
      priceStrikethrough: '1299.90',
      currency: 'BRL',
      stalePrice: false,
      priceUpdatedAt: now,
      affiliateDeepLink: 'https://www.amazon.com.br/dp/B0SEED001',
      images: [PEXELS.chair],
      specsNormalized: legacyRecordToSpecGroups({ material: 'Mesh', peso_maximo: '120kg' }),
      editorialScore: 85,
      availability: ProductAvailability.IN_STOCK,
      rating: '4.60',
      reviewCount: 128,
      categoryId: SEED_CATEGORY_HOME_OFFICE_ID,
      tags: ['ergonomica', 'home-office'],
      metaTitle: formatWebPageTitle('Cadeira Ergonômica Home Office', brand),
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
      images: [PEXELS.headset],
      specsNormalized: legacyRecordToSpecGroups({ conexao: 'USB', surround: '7.1' }),
      editorialScore: 78,
      availability: ProductAvailability.IN_STOCK,
      rating: '4.40',
      reviewCount: 56,
      categoryId: SEED_CATEGORY_TECLADOS_ID,
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
    excerpt:
      'Aprenda critérios essenciais para escolher uma cadeira ergonômica ideal para home office.',
    coverImageUrl: PEXELS.homeOfficeCover,
    body: '<p>Conteúdo editorial com embed dinâmico de produto abaixo.</p><p>[[product:cadeira-ergonomica-home-office]]</p>',
    type: ArticleType.GUIDE,
    status: ArticleStatus.PUBLISHED,
    authorId: SEED_OPERATOR_ID,
    categoryId: SEED_ARTICLE_CATEGORY_GUIAS_ID,
    seoTitle: 'Guia de cadeira ergonômica',
    seoDescription: 'Aprenda a escolher a cadeira ideal para home office.',
    seo: {},
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
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
    coverImageUrl: PEXELS.gamingCover,
    campaignOrigin: 'pinterest',
    utmDefaults: { utm_source: 'pinterest', utm_medium: 'social', utm_campaign: 'setup-gamer' },
    ctaText: 'Ver ofertas do setup',
    createdAt: now,
    updatedAt: now,
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

async function seedCategories(
  db: ReturnType<typeof drizzle<typeof schema>>,
  now: Date,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const existing = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(eq(schema.categories.id, SEED_CATEGORY_HOME_OFFICE_ID))
    .limit(1);

  if (existing.length > 0) {
    logger.info('Category seed data already present, skipping categories');
    return;
  }

  await db.insert(schema.categories).values([
    {
      id: SEED_CATEGORY_HOME_OFFICE_ID,
      slug: 'home-office',
      label: 'Home Office',
      icon: '💼',
      sortOrder: 0,
      visible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: SEED_CATEGORY_GAMES_ID,
      slug: 'games',
      label: 'Games',
      icon: '🎮',
      sortOrder: 1,
      visible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: SEED_CATEGORY_ELETRONICOS_ID,
      slug: 'eletronicos',
      label: 'Eletrônicos',
      icon: '📱',
      sortOrder: 2,
      visible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: SEED_CATEGORY_PERIFERICOS_ID,
      slug: 'perifericos',
      label: 'Periféricos',
      icon: 'keyboard',
      parentId: SEED_CATEGORY_GAMES_ID,
      sortOrder: 0,
      visible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: SEED_CATEGORY_TECLADOS_ID,
      slug: 'teclados-mecanicos',
      label: 'Teclados Mecânicos',
      icon: 'keyboard',
      parentId: SEED_CATEGORY_PERIFERICOS_ID,
      sortOrder: 0,
      visible: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  logger.info('Category hierarchy seed inserted');
}

async function seedHomePage(
  db: ReturnType<typeof drizzle<typeof schema>>,
  now: Date,
  logger: ReturnType<typeof createConsoleLogger>,
  devSeed: boolean,
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

  const brand = getBrandConfig(loadEnv());

  const blocks = devSeed ? buildDevHomePageBlocks() : buildProductionHomePageBlocks(brand);

  await insertPageWithBlocks(
    db,
    {
      id: SEED_PAGE_HOME_ID,
      slug: 'home',
      title: brand.name,
      status: PageStatus.PUBLISHED,
      seoTitle: `${formatWebHomeTitle(brand)} de produtos`,
      seoDescription: 'Descubra ofertas selecionadas com histórico de preços e alertas.',
      publishedAt: now,
      updatedAt: now,
    },
    blocks,
  );

  logger.info(
    devSeed
      ? 'Home page CMS seed inserted (dev layout)'
      : 'Home page CMS seed inserted (production layout)',
  );
}

function buildProductionHomePageBlocks(
  brand: ReturnType<typeof getBrandConfig>,
): Parameters<typeof insertPageWithBlocks>[2] {
  return [
    {
      id: SEED_BLOCK_HERO_CAROUSEL_ID,
      type: BlockType.HERO_CAROUSEL,
      sortOrder: 0,
      props: {
        slides: [
          {
            imageUrl: `https://placehold.co/1200x800?text=${encodeURIComponent(brand.name)}`,
            title: brand.name,
            subtitle: brand.tagline,
            ctaLabel: 'Conheça a vitrine',
            ctaHref: '/sobre',
          },
        ],
        autoplay: true,
        intervalMs: 6000,
      },
    },
    {
      id: SEED_BLOCK_DYNAMIC_GRID_ID,
      type: BlockType.DYNAMIC_PRODUCT_GRID,
      sortOrder: 1,
      props: FLASH_DEALS_BLOCK_PROPS,
    },
    {
      id: SEED_BLOCK_GRID_ID,
      type: BlockType.PRODUCT_GRID,
      sortOrder: 2,
      props: {
        title: 'Destaques',
        categorySlug: null,
        sort: 'editorial_score',
        pageSize: 12,
        columns: 4,
        catalogHref: '/categorias',
      },
    },
  ];
}

function buildDevHomePageBlocks(): Parameters<typeof insertPageWithBlocks>[2] {
  return [
    {
      id: SEED_BLOCK_HERO_CAROUSEL_ID,
      type: BlockType.HERO_CAROUSEL,
      sortOrder: 0,
      props: {
        slides: [
          {
            imageUrl: 'https://placehold.co/1200x800?text=Setup+Gamer',
            title: 'Monte seu setup gamer completo',
            subtitle: 'Seleção curada com os melhores custo-benefício',
            ctaLabel: 'Ver coleção',
            ctaHref: '/colecoes/setup-gamer-iniciante',
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
      id: SEED_BLOCK_DYNAMIC_GRID_ID,
      type: BlockType.DYNAMIC_PRODUCT_GRID,
      sortOrder: 1,
      props: FLASH_DEALS_BLOCK_PROPS,
    },
    {
      id: SEED_BLOCK_BENTO_ID,
      type: BlockType.CATEGORY_BENTO_GRID,
      sortOrder: 2,
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
            href: '/colecoes/setup-gamer-iniciante',
          },
        ],
      },
    },
    {
      id: SEED_BLOCK_PILLS_ID,
      type: BlockType.CATEGORY_PILLS,
      sortOrder: 3,
      props: {
        categorySlugs: ['home-office', 'games', 'eletronicos'],
        linkedBlockId: SEED_BLOCK_GRID_ID,
      },
    },
    {
      id: SEED_BLOCK_GRID_ID,
      type: BlockType.PRODUCT_GRID,
      sortOrder: 4,
      props: {
        title: 'Produtos populares',
        categorySlug: null,
        sort: 'editorial_score',
        pageSize: 12,
        columns: 4,
        catalogHref: '/categorias/home-office',
      },
    },
    {
      id: SEED_BLOCK_COLLECTION_ID,
      type: BlockType.CURATED_COLLECTION,
      sortOrder: 5,
      props: {
        collectionSlugs: ['setup-gamer-iniciante', 'home-office-essencial', 'perifericos-premium'],
        autoplay: true,
        intervalMs: 8000,
      },
    },
  ];
}

async function ensureFlashDealsHomeLayout(
  db: ReturnType<typeof drizzle<typeof schema>>,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const homePage = await db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(eq(schema.pages.slug, 'home'))
    .limit(1);

  if (homePage.length === 0) {
    return;
  }

  const pageId = homePage[0]!.id;

  await db
    .delete(schema.pageBlocks)
    .where(
      and(
        eq(schema.pageBlocks.pageId, pageId),
        inArray(schema.pageBlocks.type, [BlockType.HERO_SPLIT, BlockType.FEATURED_PRODUCT]),
      ),
    );

  const blocks = await db
    .select({
      id: schema.pageBlocks.id,
      type: schema.pageBlocks.type,
      sortOrder: schema.pageBlocks.sortOrder,
    })
    .from(schema.pageBlocks)
    .where(eq(schema.pageBlocks.pageId, pageId));

  const heroCarousel = blocks.find((row) => row.id === SEED_BLOCK_HERO_CAROUSEL_ID);
  if (heroCarousel) {
    await db
      .update(schema.pageBlocks)
      .set({ sortOrder: 0 })
      .where(eq(schema.pageBlocks.id, SEED_BLOCK_HERO_CAROUSEL_ID));
  }

  const flashDealsBlock = blocks.find((row) => row.id === SEED_BLOCK_DYNAMIC_GRID_ID);
  if (flashDealsBlock) {
    await db
      .update(schema.pageBlocks)
      .set({ sortOrder: 1, props: FLASH_DEALS_BLOCK_PROPS })
      .where(eq(schema.pageBlocks.id, SEED_BLOCK_DYNAMIC_GRID_ID));
  } else {
    const legacyDynamic = blocks.find(
      (row) => parseBlockType(row.type) === BlockType.DYNAMIC_PRODUCT_GRID,
    );
    if (legacyDynamic) {
      await db
        .update(schema.pageBlocks)
        .set({ sortOrder: 1, props: FLASH_DEALS_BLOCK_PROPS })
        .where(eq(schema.pageBlocks.id, legacyDynamic.id));
    } else {
      await db.insert(schema.pageBlocks).values({
        id: SEED_BLOCK_DYNAMIC_GRID_ID,
        pageId,
        type: BlockType.DYNAMIC_PRODUCT_GRID,
        sortOrder: 1,
        props: FLASH_DEALS_BLOCK_PROPS,
      });
    }
  }

  const duplicateDynamicIds = blocks
    .filter(
      (row) =>
        parseBlockType(row.type) === BlockType.DYNAMIC_PRODUCT_GRID &&
        row.id !== SEED_BLOCK_DYNAMIC_GRID_ID,
    )
    .map((row) => row.id);

  if (duplicateDynamicIds.length > 0) {
    await db
      .delete(schema.pageBlocks)
      .where(
        and(
          eq(schema.pageBlocks.pageId, pageId),
          inArray(schema.pageBlocks.id, duplicateDynamicIds),
        ),
      );
  }

  const bento = blocks.find((row) => row.id === SEED_BLOCK_BENTO_ID);
  if (bento) {
    await db
      .update(schema.pageBlocks)
      .set({ sortOrder: 2 })
      .where(eq(schema.pageBlocks.id, SEED_BLOCK_BENTO_ID));
  }

  const grid = blocks.find((row) => row.id === SEED_BLOCK_GRID_ID);
  if (grid) {
    await db
      .update(schema.pageBlocks)
      .set({ sortOrder: 4 })
      .where(eq(schema.pageBlocks.id, SEED_BLOCK_GRID_ID));
  }

  const collection = blocks.find((row) => row.id === SEED_BLOCK_COLLECTION_ID);
  if (collection) {
    await db
      .update(schema.pageBlocks)
      .set({ sortOrder: 5 })
      .where(eq(schema.pageBlocks.id, SEED_BLOCK_COLLECTION_ID));
  }

  logger.info('Home page layout upgraded to flash deals carousel');
}

async function seedCollections(
  db: ReturnType<typeof drizzle<typeof schema>>,
  now: Date,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  await db
    .update(schema.products)
    .set({ images: [PEXELS.chair], priceStrikethrough: '1299.90' })
    .where(eq(schema.products.slug, 'cadeira-ergonomica-home-office'));

  await db
    .update(schema.products)
    .set({ images: [PEXELS.headset], priceStrikethrough: '399.90' })
    .where(eq(schema.products.slug, 'headset-gamer-7-1'));

  await db
    .update(schema.curatedCollections)
    .set({
      coverImageUrl: PEXELS.gamingCover,
      updatedAt: now,
    })
    .where(eq(schema.curatedCollections.slug, 'setup-gamer-iniciante'));

  await db
    .update(schema.curatedCollections)
    .set({ campaignOrigin: 'organico', updatedAt: now })
    .where(eq(schema.curatedCollections.campaignOrigin, 'editorial'));

  const extraProducts = [
    {
      id: SEED_PRODUCT_TECLADO_ID,
      marketplace: Marketplace.AMAZON_BR,
      externalId: 'B0SEED003',
      slug: 'teclado-mecanico-rgb',
      titleClean: 'Teclado Mecânico RGB',
      titleRaw: 'Teclado Mecânico RGB Switch Blue',
      shortDescription: 'Teclado mecânico compacto com iluminação RGB.',
      priceAmount: '329.90',
      priceStrikethrough: '499.90',
      currency: 'BRL',
      stalePrice: false,
      priceUpdatedAt: now,
      affiliateDeepLink: 'https://www.amazon.com.br/dp/B0SEED003',
      images: [PEXELS.keyboard],
      specsNormalized: legacyRecordToSpecGroups({ switches: 'Blue', layout: 'ABNT2' }),
      editorialScore: 82,
      availability: ProductAvailability.IN_STOCK,
      rating: '4.50',
      reviewCount: 74,
      categoryId: SEED_CATEGORY_TECLADOS_ID,
      tags: ['teclado', 'mecanico'],
      createdAt: now,
    },
    {
      id: SEED_PRODUCT_MOUSE_ID,
      marketplace: Marketplace.SHOPEE_BR,
      externalId: 'SHOPEE-SEED-004',
      slug: 'mouse-gamer-sem-fio',
      titleClean: 'Mouse Gamer Sem Fio',
      titleRaw: 'Mouse Gamer Sem Fio 16000 DPI',
      shortDescription: 'Mouse leve com sensor de alta precisão e bateria longa.',
      priceAmount: '189.90',
      priceStrikethrough: '319.90',
      currency: 'BRL',
      stalePrice: false,
      priceUpdatedAt: now,
      affiliateDeepLink: 'https://shopee.com.br/mouse-gamer-seed',
      images: [PEXELS.mouse],
      specsNormalized: legacyRecordToSpecGroups({ dpi: '16000', conexao: '2.4GHz' }),
      editorialScore: 80,
      availability: ProductAvailability.IN_STOCK,
      rating: '4.70',
      reviewCount: 112,
      categoryId: SEED_CATEGORY_TECLADOS_ID,
      tags: ['mouse', 'gamer'],
      createdAt: now,
    },
  ];

  for (const product of extraProducts) {
    const existing = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.slug, product.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.products).values(product);
      logger.info(`Collection seed product inserted: ${product.slug}`);
    } else if (product.priceStrikethrough !== undefined) {
      await db
        .update(schema.products)
        .set({ priceStrikethrough: product.priceStrikethrough })
        .where(eq(schema.products.slug, product.slug));
    }
  }

  const extraCollections = [
    {
      id: SEED_COLLECTION_HOME_OFFICE_ID,
      slug: 'home-office-essencial',
      title: 'Home office essencial',
      description: 'Conforto e produtividade para o dia a dia em casa.',
      coverImageUrl: PEXELS.homeOfficeCover,
      campaignOrigin: 'organico',
      utmDefaults: {
        utm_source: 'vitrine',
        utm_medium: 'home',
        utm_campaign: 'home-office-essencial',
      },
      ctaText: 'Ver seleção home office',
      products: [
        { productId: SEED_PRODUCT_AMAZON_ID, sortOrder: 0 },
        { productId: SEED_PRODUCT_TECLADO_ID, sortOrder: 1 },
      ],
    },
    {
      id: SEED_COLLECTION_PERIFERICOS_ID,
      slug: 'perifericos-premium',
      title: 'Periféricos premium',
      description: 'Teclado, mouse e áudio para elevar seu setup.',
      coverImageUrl: PEXELS.peripheralsCover,
      campaignOrigin: 'organico',
      utmDefaults: {
        utm_source: 'vitrine',
        utm_medium: 'home',
        utm_campaign: 'perifericos-premium',
      },
      ctaText: 'Explorar periféricos',
      products: [
        { productId: SEED_PRODUCT_TECLADO_ID, sortOrder: 0 },
        { productId: SEED_PRODUCT_MOUSE_ID, sortOrder: 1 },
        { productId: SEED_PRODUCT_SHOPEE_ID, sortOrder: 2 },
      ],
    },
  ] as const;

  for (const collection of extraCollections) {
    const existing = await db
      .select({ id: schema.curatedCollections.id })
      .from(schema.curatedCollections)
      .where(eq(schema.curatedCollections.slug, collection.slug))
      .limit(1);

    if (existing.length > 0) {
      continue;
    }

    const { products, ...collectionRow } = collection;
    await db.insert(schema.curatedCollections).values({
      ...collectionRow,
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(schema.collectionProducts).values(
      products.map((pivot) => ({
        collectionId: collection.id,
        productId: pivot.productId,
        sortOrder: pivot.sortOrder,
      })),
    );
    logger.info(`Collection seed inserted: ${collection.slug}`);
  }
}

async function ensureBentoHubMixHomeBlock(
  db: ReturnType<typeof drizzle<typeof schema>>,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  await db.execute(sql`ALTER TYPE "block_type" ADD VALUE IF NOT EXISTS 'bento_hub_mix'`);

  const homePage = await db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(eq(schema.pages.slug, 'home'))
    .limit(1);

  if (homePage.length === 0) {
    return;
  }

  const pageId = homePage[0]!.id;
  const blocks = await db
    .select({
      id: schema.pageBlocks.id,
      type: schema.pageBlocks.type,
      sortOrder: schema.pageBlocks.sortOrder,
    })
    .from(schema.pageBlocks)
    .where(eq(schema.pageBlocks.pageId, pageId));

  const existing = blocks.find((row) => row.id === SEED_BLOCK_BENTO_HUB_MIX_ID);
  if (existing) {
    await db
      .update(schema.pageBlocks)
      .set({ props: BENTO_HUB_MIX_BLOCK_PROPS })
      .where(eq(schema.pageBlocks.id, SEED_BLOCK_BENTO_HUB_MIX_ID));
    logger.info('Bento hub mix block props refreshed on home page');
    return;
  }

  const legacy = blocks.find((row) => parseBlockType(row.type) === BlockType.BENTO_HUB_MIX);
  if (legacy) {
    await db
      .update(schema.pageBlocks)
      .set({ props: BENTO_HUB_MIX_BLOCK_PROPS, sortOrder: 3 })
      .where(eq(schema.pageBlocks.id, legacy.id));
    logger.info('Legacy bento hub mix block upgraded on home page');
    return;
  }

  const pills = blocks.find((row) => row.id === SEED_BLOCK_PILLS_ID);
  if (pills) {
    await db
      .update(schema.pageBlocks)
      .set({ sortOrder: 4 })
      .where(eq(schema.pageBlocks.id, SEED_BLOCK_PILLS_ID));
  }

  const grid = blocks.find((row) => row.id === SEED_BLOCK_GRID_ID);
  if (grid) {
    await db
      .update(schema.pageBlocks)
      .set({ sortOrder: 5 })
      .where(eq(schema.pageBlocks.id, SEED_BLOCK_GRID_ID));
  }

  const collection = blocks.find((row) => row.id === SEED_BLOCK_COLLECTION_ID);
  if (collection) {
    await db
      .update(schema.pageBlocks)
      .set({ sortOrder: 6 })
      .where(eq(schema.pageBlocks.id, SEED_BLOCK_COLLECTION_ID));
  }

  await db.insert(schema.pageBlocks).values({
    id: SEED_BLOCK_BENTO_HUB_MIX_ID,
    pageId,
    type: BlockType.BENTO_HUB_MIX,
    sortOrder: 3,
    props: BENTO_HUB_MIX_BLOCK_PROPS,
  });

  logger.info('Bento hub mix block added to home page');
}

async function ensureCuratedCollectionHomeBlock(
  db: ReturnType<typeof drizzle<typeof schema>>,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const homePage = await db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(eq(schema.pages.slug, 'home'))
    .limit(1);

  if (homePage.length === 0) {
    return;
  }

  const pageId = homePage[0]!.id;

  const curatedBlocks = await db
    .select({
      id: schema.pageBlocks.id,
      type: schema.pageBlocks.type,
      props: schema.pageBlocks.props,
    })
    .from(schema.pageBlocks)
    .where(eq(schema.pageBlocks.pageId, pageId));

  const carouselProps = {
    collectionSlugs: ['setup-gamer-iniciante', 'home-office-essencial', 'perifericos-premium'],
    autoplay: true,
    intervalMs: 8000,
  };

  const seedBlock = curatedBlocks.find((row) => row.id === SEED_BLOCK_COLLECTION_ID);
  if (seedBlock) {
    await db
      .update(schema.pageBlocks)
      .set({ props: carouselProps })
      .where(eq(schema.pageBlocks.id, SEED_BLOCK_COLLECTION_ID));
    logger.info('Curated collection block props refreshed on home page');
    return;
  }

  const legacyBlock = curatedBlocks.find(
    (row) => parseBlockType(row.type) === BlockType.CURATED_COLLECTION,
  );
  if (legacyBlock) {
    await db
      .update(schema.pageBlocks)
      .set({ props: carouselProps })
      .where(eq(schema.pageBlocks.id, legacyBlock.id));
    logger.info('Legacy curated collection block upgraded to carousel on home page');
    return;
  }

  await db.insert(schema.pageBlocks).values({
    id: SEED_BLOCK_COLLECTION_ID,
    pageId,
    type: BlockType.CURATED_COLLECTION,
    sortOrder: 7,
    props: carouselProps,
  });

  logger.info('Curated collection block added to home page');
}

async function seedArticleCategories(
  db: ReturnType<typeof drizzle<typeof schema>>,
  now: Date,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const existing = await db
    .select({ id: schema.articleCategories.id })
    .from(schema.articleCategories)
    .where(eq(schema.articleCategories.id, SEED_ARTICLE_CATEGORY_GUIAS_ID))
    .limit(1);

  if (existing.length > 0) {
    logger.info('Article categories seed data already present, skipping');
    return;
  }

  await db.insert(schema.articleCategories).values([
    {
      id: SEED_ARTICLE_CATEGORY_GUIAS_ID,
      name: 'Guias',
      slug: 'guias',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: SEED_ARTICLE_CATEGORY_REVIEWS_ID,
      name: 'Reviews',
      slug: 'reviews',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: SEED_ARTICLE_CATEGORY_COMPARATIVOS_ID,
      name: 'Comparativos',
      slug: 'comparativos',
      createdAt: now,
      updatedAt: now,
    },
  ]);

  logger.info('Article categories seed inserted');
}

async function seedOperator(
  db: ReturnType<typeof drizzle<typeof schema>>,
  logger: ReturnType<typeof createConsoleLogger>,
  devSeed: boolean,
  env: ReturnType<typeof loadEnv>,
): Promise<void> {
  const brand = getBrandConfig(env);
  const existing = await db
    .select({ id: schema.operators.id })
    .from(schema.operators)
    .where(eq(schema.operators.id, SEED_OPERATOR_ID))
    .limit(1);

  const passwordHasher = new BcryptPasswordHasher(env.PASSWORD_PEPPER);
  const passwordHash = await passwordHasher.hash(env.ADMIN_SEED_PASSWORD);

  logger.info('Hashing operator seed password', {
    email: env.ADMIN_SEED_EMAIL,
    pepperLength: env.PASSWORD_PEPPER.length,
  });

  const operatorProfile = devSeed
    ? {
        avatarUrl: PEXELS.authorAvatar,
        bio: 'Especialista em curadoria de produtos para home office e setup gamer, com foco em ergonomia e custo-benefício.',
        jobTitle: 'Fundador e curador-chefe',
        showOnTeam: true,
        teamPublicRole: TeamPublicRole.FOUNDER,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/vitrine',
          instagram: brand.socials.instagram,
        },
      }
    : {
        avatarUrl: null,
        bio: null,
        jobTitle: 'Administrador',
        showOnTeam: false,
        teamPublicRole: TeamPublicRole.MEMBER,
        socialLinks: {
          instagram: brand.socials.instagram,
        },
      };

  if (existing.length > 0) {
    await db
      .update(schema.operators)
      .set({
        email: env.ADMIN_SEED_EMAIL.toLowerCase(),
        passwordHash,
        name: `Administrador ${brand.name}`,
        role: 'admin',
        ...operatorProfile,
        updatedAt: new Date(),
      })
      .where(eq(schema.operators.id, SEED_OPERATOR_ID));
    logger.info('Operator seed profile and password updated', { email: env.ADMIN_SEED_EMAIL });
    return;
  }

  await db.insert(schema.operators).values({
    id: SEED_OPERATOR_ID,
    email: env.ADMIN_SEED_EMAIL.toLowerCase(),
    passwordHash,
    name: `Administrador ${brand.name}`,
    role: 'admin',
    status: 'active',
    ...operatorProfile,
  });

  logger.info('Operator seed inserted', { email: env.ADMIN_SEED_EMAIL });
}

async function seedSiteSettings(
  db: ReturnType<typeof drizzle<typeof schema>>,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const existing = await db
    .select({ id: schema.siteSettings.id })
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.id, SITE_SETTINGS_ROW_ID))
    .limit(1);

  if (existing.length > 0) {
    logger.info('Site settings seed already present, skipping');
    return;
  }

  await db.insert(schema.siteSettings).values({
    id: SITE_SETTINGS_ROW_ID,
    settings: DEFAULT_SITE_SETTINGS,
    updatedBy: SEED_OPERATOR_ID,
  });

  logger.info('Site settings seed inserted');
}

async function seedAboutPage(
  db: ReturnType<typeof drizzle<typeof schema>>,
  now: Date,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const existing = await db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(eq(schema.pages.slug, 'sobre'))
    .limit(1);

  const brand = getBrandConfig(loadEnv());
  const aboutContent = buildDefaultAboutPageContent(brand);

  if (existing.length > 0) {
    await db
      .update(schema.pages)
      .set({
        pageKind: PageKind.INSTITUTIONAL,
        institutionalContent: aboutContent,
        updatedAt: now,
      })
      .where(eq(schema.pages.slug, 'sobre'));
    logger.info('About page seed updated');
    return;
  }

  await db.insert(schema.pages).values({
    id: SEED_PAGE_SOBRE_ID,
    slug: 'sobre',
    title: 'Sobre',
    status: PageStatus.PUBLISHED,
    pageKind: PageKind.INSTITUTIONAL,
    seoTitle: formatWebPageTitle('Sobre', brand),
    seoDescription: aboutContent.heroIntro.slice(0, 160),
    institutionalContent: aboutContent,
    publishedAt: now,
    updatedAt: now,
  });

  logger.info('About page seed inserted');
}

async function seedAutoLinks(
  db: ReturnType<typeof drizzle<typeof schema>>,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const existing = await db.select({ id: schema.autoLinks.id }).from(schema.autoLinks).limit(1);
  if (existing.length > 0) {
    logger.info('Auto links already seeded, skipping');
    return;
  }

  await db.insert(schema.autoLinks).values(
    SEO_KEYWORD_MAP.map((item, index) => ({
      keyword: item.keyword,
      targetUrl: item.targetUrl,
      maxMatches: item.maxMatches ?? 1,
      priority: index,
      isActive: true,
    })),
  );

  logger.info('Auto links seed inserted', { count: SEO_KEYWORD_MAP.length });
}

async function seedContentClusters(
  db: ReturnType<typeof drizzle<typeof schema>>,
  now: Date,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const pilar = await db
    .select({ id: schema.contentArticles.id })
    .from(schema.contentArticles)
    .where(eq(schema.contentArticles.id, SEED_ARTICLE_ID))
    .limit(1);

  if (pilar.length === 0) {
    logger.info('Pillar article missing, skipping content cluster seed');
    return;
  }

  const existingCluster = await db
    .select({ id: schema.contentClusters.id })
    .from(schema.contentClusters)
    .where(eq(schema.contentClusters.id, SEED_CONTENT_CLUSTER_ID))
    .limit(1);

  if (existingCluster.length > 0) {
    logger.info('Content cluster seed already present, skipping');
    return;
  }

  const spokePublishedAt1 = new Date(now);
  spokePublishedAt1.setDate(spokePublishedAt1.getDate() - 14);
  const spokePublishedAt2 = new Date(now);
  spokePublishedAt2.setDate(spokePublishedAt2.getDate() - 7);

  await db.insert(schema.contentArticles).values([
    {
      id: SEED_ARTICLE_SPOKE_1_ID,
      slug: 'ajuste-lombar-cadeira-ergonomica',
      title: 'Ajuste lombar: o que observar na cadeira ergonômica',
      excerpt:
        'Entenda como o suporte lombar correto reduz fadiga em jornadas longas de home office.',
      coverImageUrl: PEXELS.chair,
      body: '<p>Conteúdo satélite sobre ajuste lombar e ergonomia.</p>',
      type: ArticleType.GUIDE,
      status: ArticleStatus.PUBLISHED,
      authorId: SEED_OPERATOR_ID,
      categoryId: SEED_ARTICLE_CATEGORY_GUIAS_ID,
      seoTitle: 'Ajuste lombar em cadeiras ergonômicas',
      seoDescription: 'Guia rápido sobre suporte lombar.',
      seo: {},
      publishedAt: spokePublishedAt1,
      createdAt: spokePublishedAt1,
      updatedAt: spokePublishedAt1,
    },
    {
      id: SEED_ARTICLE_SPOKE_2_ID,
      slug: 'cadeira-ergonomica-vs-gamer',
      title: 'Cadeira ergonômica vs gamer: qual escolher?',
      excerpt: 'Comparativo editorial entre cadeiras ergonômicas e gamer para uso diário.',
      coverImageUrl: PEXELS.homeOfficeCover,
      body: '<p>Conteúdo satélite comparando perfis de uso e conforto.</p>',
      type: ArticleType.COMPARISON,
      status: ArticleStatus.PUBLISHED,
      authorId: SEED_OPERATOR_ID,
      categoryId: SEED_ARTICLE_CATEGORY_COMPARATIVOS_ID,
      seoTitle: 'Ergonômica vs gamer',
      seoDescription: 'Comparativo para home office.',
      seo: {},
      publishedAt: spokePublishedAt2,
      createdAt: spokePublishedAt2,
      updatedAt: spokePublishedAt2,
    },
  ]);

  await db.insert(schema.contentClusters).values({
    id: SEED_CONTENT_CLUSTER_ID,
    name: 'Especial Cadeira Ergonômica',
    slug: 'especial-cadeira-ergonomica',
    description:
      'Guia pilar e artigos satélite sobre escolha, ajustes e comparativos de cadeiras ergonômicas.',
    pilarArticleId: SEED_ARTICLE_ID,
    createdAt: now,
    updatedAt: now,
  });

  await db
    .update(schema.contentArticles)
    .set({ clusterId: SEED_CONTENT_CLUSTER_ID, updatedAt: now })
    .where(
      inArray(schema.contentArticles.id, [
        SEED_ARTICLE_ID,
        SEED_ARTICLE_SPOKE_1_ID,
        SEED_ARTICLE_SPOKE_2_ID,
      ]),
    );

  logger.info('Content cluster seed inserted', { slug: 'especial-cadeira-ergonomica' });
}

async function refreshProductionBrandContent(
  db: ReturnType<typeof drizzle<typeof schema>>,
  now: Date,
  logger: ReturnType<typeof createConsoleLogger>,
): Promise<void> {
  const brand = getBrandConfig(loadEnv());

  const homeRows = await db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(eq(schema.pages.slug, 'home'))
    .limit(1);

  if (homeRows.length > 0) {
    const homeId = homeRows[0]!.id;

    await db
      .update(schema.pages)
      .set({
        title: brand.name,
        seoTitle: `${formatWebHomeTitle(brand)} de produtos`,
        updatedAt: now,
      })
      .where(eq(schema.pages.id, homeId));

    const heroBlocks = await db
      .select({ id: schema.pageBlocks.id, props: schema.pageBlocks.props })
      .from(schema.pageBlocks)
      .where(
        and(
          eq(schema.pageBlocks.pageId, homeId),
          eq(schema.pageBlocks.type, BlockType.HERO_CAROUSEL),
        ),
      );

    for (const block of heroBlocks) {
      const parsedProps = heroCarouselPropsSchema.safeParse(block.props);
      if (!parsedProps.success || parsedProps.data.slides.length === 0) {
        continue;
      }

      const slides = [...parsedProps.data.slides];
      const firstSlide = slides[0];
      if (!firstSlide) {
        continue;
      }

      slides[0] = {
        ...firstSlide,
        imageUrl: `https://placehold.co/1200x800?text=${encodeURIComponent(brand.name)}`,
        title: brand.name,
        subtitle: brand.tagline,
      };

      await db
        .update(schema.pageBlocks)
        .set({ props: { ...parsedProps.data, slides } })
        .where(eq(schema.pageBlocks.id, block.id));
    }

    logger.info('Home page brand content refreshed', { siteName: brand.name });
  }

  await db
    .update(schema.operators)
    .set({ name: `Administrador ${brand.name}`, updatedAt: now })
    .where(eq(schema.operators.id, SEED_OPERATOR_ID));

  logger.info('Production brand content refreshed from env', { siteName: brand.name });
}

runSeed().catch((error: unknown) => {
  const logger = createConsoleLogger();
  const message = error instanceof Error ? error.message : String(error);
  logger.error('Seed failed', { message });
  process.exit(1);
});
