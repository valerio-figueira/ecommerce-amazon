# Contexto LLM — Domínio, schema e interfaces

> **Propósito:** referência condensada de entidades, enums, ports, tabelas PostgreSQL, schemas Zod CMS e contratos de interface. Fonte de verdade no código: `packages/domain`, `packages/infrastructure/.../schema`, `packages/shared`.

---

## Entidades principais

### `Product` — `packages/domain/src/entities/Product.ts`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `ProductId` (uuid branded) | |
| `marketplace` | `Marketplace` | `amazon_br`, `shopee_br`, `mercadolivre_br` |
| `externalId` | string | ID no parceiro |
| `slug` | `Slug` | kebab-case, único global |
| `titleClean`, `titleRaw` | string | |
| `price` | `Price` VO | inclui `isStale` |
| `strikethroughPrice` | number? | para cálculo de desconto |
| `affiliateLink` | `AffiliateLink` VO | HTTPS obrigatório |
| `images` | string[] | URLs |
| `specsNormalized` | Record<string, string> | |
| `editorialScore` | number | 0–100 no DB; UI admin 0–10 |
| `availability` | `ProductAvailability` | |
| `rating`, `reviewCount` | number? | |
| `categoryId` | string? | FK folha da árvore |
| `tags` | string[] | |
| `metaTitle`, `metaDescription` | string? | SEO; fallback automático na vitrine |
| `canonicalUrl` | string? | Editorial Override; NULL → `/produtos/{slug}` |
| `pros`, `cons` | string[]? | editorial |
| `visible` | boolean | oculta da home se false |
| `createdAt` | Date | |

**Comportamento:** `updatePrice()` emite `PriceDropped` se cai; `markPriceStale()` para SLA 24h; getter `shouldShowPrice` (false quando stale); `pullDomainEvents()` outbox em memória.

### `Category` — árvore hierárquica

`parentId` (nullable = raiz), `slug` único global, `label`, `icon`, `sortOrder`, `seoTitle`, `seoDescription`, `descriptionHtml`, IDs marketplace (`amazon_browse_node`, etc.), `visible`.

Produto vincula-se à **folha**. `GET /products?category=slug` filtra **subárvore inteira**.

### `PageLayout` / `PageBlock` (CMS)

**PageLayout:** `id`, `slug`, `title`, `status` (`draft`|`published`), `seoTitle?`, `seoDescription?`, `publishedAt?`, `updatedAt`.

**PageBlock:** `id`, `pageId`, `type` (`BlockType`), `sortOrder`, `props` (JSON), `visibility` (`all`|`desktop`|`mobile`).

Regra DB: apenas um layout `published` por `slug` (índice UNIQUE `(slug, status)`).

### Outras entidades

| Entidade | Uso |
|----------|-----|
| `PriceSnapshot` | Histórico diário de preços |
| `PriceAlert` | Double opt-in: `pending` → `active` → `triggered` \| `expired` |
| `WishlistItem` | Sessão anônima (`sessionId`) + produto |
| `ContentArticle` | Artigos editoriais; `body` HTML + shortcodes `[[product:slug]]` |
| `ContentProductEmbed` | `productId`, `position`, `variant` (`inline`\|`highlight`\|`comparison`) |
| `ArticleCategory` | Taxonomia editorial (não confundir com `Category` de produtos) |
| `CuratedCollection` | Coleção curada com `productIds[]`, UTM defaults |
| `Coupon` | Verificado pelo Pipeline D; `unverified` até confirmação |
| `ProductComparison` | 2–3 produtos + `shareToken` + `editorialIntro` (≥150 chars) |
| `Operator` | Operador CMS: `email`, `name`, `avatarUrl`, `bio`, `role`, `status` |

---

## Value Objects

| VO | Regras |
|----|--------|
| `ProductId` | UUID v4 |
| `Slug` | `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` |
| `Price` | `amount >= 0`, `currency` BRL/USD, `isStale`, `updatedAt`; `meetsTarget()`, `droppedByPercent()`, `withStale()` |
| `Email` | formato válido, lowercase |
| `AffiliateLink` | URL HTTPS |

---

## Enums consolidados

### Negócio (`packages/domain/src/enums/index.ts`)

| Enum | Valores |
|------|---------|
| `Marketplace` | `amazon_br`, `shopee_br`, `mercadolivre_br` |
| `ProductAvailability` | `in_stock`, `out_of_stock`, `unknown` |
| `AlertStatus` | `pending`, `active`, `triggered`, `expired` |
| `ArticleType` | `guide`, `review`, `comparison`, `lookbook_social` |
| `ArticleStatus` | `draft`, `published` |
| `CouponStatus` | `active`, `expired`, `unverified` |
| `DiscountType` | `percent`, `fixed` |
| `SnapshotSource` | `worker_cron`, `manual_override` |
| `SyncJobType` | `full_sync`, `price_refresh`, `hygiene`, `link_validation`, `coupon_verify` |
| `SyncJobStatus` | `running`, `completed`, `failed` |
| `ClickOrigin` | `listagem`, `detalhe`, `embed`, `comparador`, `cupons`, `redirect_go`, `coleção` |
| `AffiliateAccountStatus` | `pending_manual_validation`, `active`, `suspended` |

### CMS (`packages/domain/src/enums/cms.ts`)

| Enum | Valores |
|------|---------|
| `BlockType` | ver tabela abaixo |
| `PageStatus` | `draft`, `published` |
| `BlockVisibility` | `all`, `desktop`, `mobile` |
| `ProductSortField` | `editorial_score`, `price_updated_at`, `created_at`, `price_asc`, `price_desc`, `discount_percent_desc` |

### `BlockType` — catálogo completo

| BlockType | Componente web | Dados dinâmicos | Form admin |
|-----------|----------------|-----------------|------------|
| `hero_carousel` | `HeroCarouselBlock` | Estático (slides) | ✅ HeroCarouselForm |
| `hero_split` | `HeroSplitBlock` | Compõe blocos por ID | ⏳ fase 2 |
| `featured_product` | `FeaturedProductBlock` | `GET /products/:slug` | ✅ FeaturedProductForm |
| `category_pills` | `CategoryPillsBlock` | `GET /categories` | ✅ CategoryPillsForm |
| `category_bento_grid` | `CategoryBentoGridBlock` | Estático (tiles) | ✅ CategoryBentoGridForm |
| `product_grid` | `ProductGridBlock` | `GET /products?...` | ✅ ProductGridForm |
| `dynamic_product_grid` | `DynamicProductGridBlock` | BFF `renderedData` | ✅ DynamicGridForm |
| `curated_collection` | `CuratedCollectionBlock` | BFF `renderedCollections` | ⏳ fase 2 |
| `coupon_strip` | `CouponStripBlock` | Stub / futuro | ⏳ fase 2 |
| `bento_hub_mix` | `BentoHubMixBlock` | BFF `renderedBentoHubMix` | ✅ BentoHubMixForm |
| `rich_text` | `RichTextBlock` | HTML estático | ✅ BlockPropsForm |
| `banner` | `BannerBlock` | Imagem + link | ✅ BlockPropsForm |
| `spacer` | `SpacerBlock` | Espaçamento | ✅ BlockPropsForm |

Schemas Zod de props: `packages/shared/src/cms/block-schemas.ts` — função `parseBlockProps(type, props)`.

DTOs de entrega com hidratação: `PageBlockDeliveryDto` inclui `renderedData?`, `renderedCollections?`, `renderedBentoHubMix?` (voláteis, fora do cache Redis).

---

## Ports — repositórios (interfaces em `packages/domain/src/repositories/`)

### `ProductRepository`
`findById`, `findBySlug`, `findByExternalId`, `findPublished(filters)`, `findByIds`, `findDueForPriceRefresh`, `findDueForCatalogSync`, `save`, `saveBatch`.

`ProductListFilters`: `page?`, `pageSize?`, `categoryIds?`, `marketplace?`, `sort?`, `minDiscountPercentage?`, `freshPriceOnly?`, `visibleOnly?`.

### `CategoryRepository`
CRUD + `getDescendantIds`, `getAncestorChain`, contagens por subárvore.

### `PageRepository`
`findPublishedBySlug` → `{ layout, blocks }`; mutações admin: `insertBlockAtPosition`, `saveBlock`, `deleteBlock`, `updateBlocksOrder`, `listAdminPages`, `findAdminBySlug`.

### `WishlistRepository`
`findBySessionId`, `add`, `remove`, `countBySessionAndMarketplace`.

### `PriceAlertRepository`
`findByConfirmToken`, `countActiveByEmail`, `findActiveForProduct`, `updateStatus`.

### `ContentRepository`
`findArticleBySlug`, `findCollectionBySlug`, `findRelatedArticles`.

### Outros
`CouponRepository`, `ProductComparisonRepository`, `ClickEventRepository`, `SyncJobLogRepository`, `CuratedCollectionRepository`, `AffiliateAccountRepository`, `ArticleCategoryRepository`, `OperatorRepository`.

---

## Ports — gateways (`packages/domain/src/gateways/`)

| Interface | Implementação |
|-----------|---------------|
| `MarketplaceFetcher` | `apps/worker` (único fetch externo) |
| `MarketplaceFetcherFactory` | strategy por marketplace |
| `AffiliateLinkBuilder` | deep link + batch checkout |
| `EmailSender` | Resend adapter |
| `CacheStore` | Redis |
| `CacheInvalidator` | Redis INCR version stamp |
| `EventBus` | BullMQ `domain_events` |
| `PageCacheInvalidator` | invalidação layout CMS por slug |

---

## Use cases (`packages/application/src/`)

| Grupo | Use cases |
|-------|-----------|
| `page/` | `GetPublishedPageLayout` |
| `product/` | `ListProducts`, `GetProductBySlug`, `GetProductPriceHistory`, `CreateProduct`, `UpdateProduct`, `ListAdminProducts` |
| `category/` | `ListCategoryTree`, `GetCategoryBySlug` |
| `admin-category/` | `ListAdminCategories`, `CreateCategory`, `UpdateCategory`, `DeleteCategory`, `ReorderCategories` |
| `wishlist/` | `GetWishlist`, `AddToWishlist`, `BuildBatchCheckoutRedirect` |
| `alert/` | `CreatePriceAlert`, `ConfirmPriceAlert` |
| `content/` | `GetArticleWithEmbeds`, `GetCuratedCollection`, `ListArticlesByCategory` |
| `coupon/` | `ListActiveCoupons` |
| `comparison/` | `CreateComparison`, `GetComparisonByToken` |
| `events/` | `RecordClickEvent` |
| `affiliate/` | `ResolveAffiliateRedirect` |
| `admin-auth/` | `AuthenticateOperator` |
| `admin-cms/` | `GetAdminPageLayout`, `ListAdminPages`, `SavePageBlock`, `DeletePageBlock`, `UpdatePageBlocksOrder` |
| `admin-article/` | CRUD artigos |
| `admin-article-category/` | CRUD categorias editoriais |
| `admin-collection/` | CRUD coleções |
| `sync/` | `SyncCatalogBatch`, `UpdatePricesBatch`, `RunHygienePipeline`, `VerifyCouponsBatch` |

Padrão de retorno: `Result<T, E>` com `ok()` / `err()` de `shared`.

---

## Schema PostgreSQL (Drizzle)

Fonte: `packages/infrastructure/src/persistence/drizzle/schema/`
Migrations: `packages/infrastructure/src/persistence/drizzle/migrations/`

### Tabelas principais

| Tabela | Propósito | FKs notáveis |
|--------|-----------|--------------|
| `products` | Catálogo | `category_id` → `categories` |
| `categories` | Árvore hierárquica | `parent_id` → self |
| `pages` | Layouts CMS | UNIQUE `(slug, status)` |
| `page_blocks` | Blocos CMS | `page_id` → `pages` |
| `price_snapshots` | Histórico preço | `product_id` |
| `price_alerts` | Alertas double opt-in | `product_id` |
| `wishlist_items` | Wishlist anônima | `product_id` |
| `content_articles` | Artigos | `author_id` → `operators`, `category_id` → `article_categories` |
| `content_product_embeds` | Embeds em artigos | `article_id`, `product_id` |
| `article_categories` | Taxonomia editorial | — |
| `curated_collections` | Coleções | — |
| `collection_products` | Pivot coleção↔produto | UNIQUE `(collection_id, product_id)` |
| `product_comparisons` | Comparador | — |
| `comparison_products` | Pivot comparador | — |
| `coupons` | Cupons | — |
| `click_events` | Telemetria cliques | `product_id`, `block_id` → `page_blocks` |
| `auto_links` | Interlinkagem SEO | keywords → target_url |
| `operators` | Operadores CMS | — |
| `affiliate_accounts` | Tags afiliado | `status` inclui `pending_manual_validation` |
| `sync_job_logs` | Auditoria worker | — |

### Colunas críticas `products`

| Coluna | Notas |
|--------|-------|
| `stale_price` | boolean; SLA 24h |
| `price_updated_at` | timestamptz |
| `price_strikethrough` | para desconto % |
| `affiliate_deep_link` | URL com tag |
| `editorial_score` | int 0–100 |
| `visible` | default true; home filtra |
| `canonical_url` | nullable; override SEO |
| `meta_title`, `meta_description` | nullable; fallback automático |

### Migrations relevantes (ordem)

| Migration | Conteúdo |
|-----------|----------|
| `0001_cms_pages.sql` | CMS pages + blocks |
| `0003_dynamic_product_grid.sql` | BlockType dinâmico |
| `0004_operators.sql` | Operadores admin |
| `0005_category_bento_grid.sql` | Bloco bento categorias |
| `0006_mercadolivre_br.sql` | Marketplace ML |
| `0007_product_visible.sql` | Coluna visible |
| `0008_categories_hierarchy.sql` | Árvore categorias |
| `0009_curated_collections_constraints.sql` | Timestamps coleções |
| `0013_article_taxonomy_authors.sql` | Categorias artigo + avatar/bio operador |

### Seed dev (`packages/infrastructure/.../seed.ts`)

| Entidade | Slug / ID exemplo |
|----------|-------------------|
| Produto Amazon | `cadeira-ergonomica-home-office` |
| Produto Shopee | `headset-gamer-7-1` |
| Artigo | `guia-cadeira-ergonomica` |
| Coleção | `setup-gamer-iniciante` |
| Cupom | `VITRINE10` |
| Page home | `home` (vários blocos) |
| Operador | `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` |

Produção: seed ignorado salvo `SEED_FORCE=true`.

---

## DTOs públicos principais (API presenters)

### `ProductListItemDto`
```typescript
{
  id, slug, title, marketplace, rating?, reviewCount?, imageUrl?,
  price: { amount: number | null, currency, isStale, updatedAt, strikethrough? },
  goUrl: string  // /go/{slug}
}
```

### `ProductDetailDto`
`ProductListItemDto` + `titleRaw`, `externalId`, `availability`, `shortDescription?`, `longDescriptionHtml?`, `images[]`, `specs`, `pros?`, `cons?`, `metaTitle?`, `metaDescription?`, `canonicalUrl?`.

### `PageLayoutDto` / `PageBlockDto`
```typescript
PageLayoutDto = { slug, title, seoTitle?, seoDescription?, blocks: PageBlockDto[] }
PageBlockDto = { id, type, sortOrder, visibility, props, renderedData?, renderedCollections?, renderedBentoHubMix? }
```

### `ArticlePublicDetail`
`slug`, `title`, `excerpt`, `coverImageUrl`, `body` (cru, sem auto-links), `type`, `seoTitle`, `seoDescription`, `author?`, `category?`, `relatedArticles[]`, `publishedAt`.

### `CategoryTreeItem` / `CategoryDetail`
Árvore recursiva com `productCount`; detalhe com `breadcrumbs`, `children`, `descriptionHtml`.

---

## Schemas shared — módulos transversais

| Módulo | Path | Uso |
|--------|------|-----|
| Env | `packages/shared/src/index.ts` | `loadEnv()` |
| CORS | `packages/shared/src/cors.ts` | `createCorsOriginDelegate()` |
| CMS | `packages/shared/src/cms/block-schemas.ts` | Props por BlockType |
| Admin produtos | `packages/shared/src/admin/product-schemas.ts` | `@ecommerce-amazon/shared/admin` |
| Admin artigos | `packages/shared/src/admin/article-schemas.ts` | |
| SEO canonical | `packages/shared/src/seo/product-canonical.ts` | `resolveProductCanonicalUrl` |
| SEO meta | `packages/shared/src/seo/product-meta.ts` | `resolveProductMetaTitle/Description` |
| SEO JSON-LD | `packages/shared/src/seo/product-json-ld.ts` | `buildProductJsonLd` |
| SEO links | `packages/shared/src/seo/link-parser.ts` | `injectInternalLinks` |
| SEO keywords | `packages/shared/src/seo/keywords.ts` | `SEO_KEYWORD_MAP` estático |
| Shortcodes | `packages/shared/src/content/article-shortcodes.ts` | `[[product:slug]]` parser |
| Marketplace URL | `packages/shared/src/marketplace/parse-product-url.ts` | Parser Amazon/Shopee/ML |
| Category tree | `packages/shared/src/category/category-tree-nav.ts` | Helpers navegação |

---

## Web client — integração API

- `apps/web/src/lib/api/client.ts` — `apiFetch`, header `x-session-id`
- `apps/web/src/lib/api/schemas.ts` — Zod espelhando presenters
- Admin BFF: `apps/admin/src/app/api/admin/**` — proxy com JWT cookie `vitrine_admin_token`
