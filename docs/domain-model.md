# Modelo de domínio

Fonte: [`packages/domain`](../packages/domain). Plano: [PRD Core](../.cursor/plans/prd_plataforma_afiliação_de44933f.plan.md) §1.

## Entidades

### `Product`

Arquivo: [`packages/domain/src/entities/Product.ts`](../packages/domain/src/entities/Product.ts).

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `ProductId` (branded uuid) | |
| `marketplace` | `Marketplace` | |
| `externalId` | string | ID no parceiro |
| `slug` | `Slug` | kebab-case validado |
| `titleClean`, `titleRaw` | string | |
| `price` | `Price` VO | inclui `isStale` |
| `strikethroughPrice` | number? | |
| `affiliateLink` | `AffiliateLink` VO | HTTPS obrigatório |
| `images` | string[] | |
| `specsNormalized` | Record<string, string> | |
| `editorialScore` | number | |
| `availability` | `ProductAvailability` | |
| `rating`, `reviewCount` | number? | |
| `categoryId` | string? | FK categoria folha |
| `tags` | string[] | |
| `metaTitle`, `metaDescription`, `canonicalUrl` | string? | SEO; `canonicalUrl` = sobrescrita editorial (NULL → vitrine gera `/produtos/{slug}`) |
| `pros`, `cons` | string[]? | editorial |
| `createdAt` | Date | |

**Comportamento:**

- `updatePrice(newPrice)` — emite `PriceDropped` se valor cai
- `markPriceStale()` — SLA 24h estourado
- `shouldShowPrice` — getter; `false` quando `price.isStale`, oculta valor numérico na UI/API
- `pullDomainEvents()` — padrão outbox em memória

### `Category`

Arquivo: [`packages/domain/src/entities/Category.ts`](../packages/domain/src/entities/Category.ts).

Árvore hierárquica (`parentId`), slug único global, campos SEO (`seoTitle`, `descriptionHtml`) e IDs de marketplace para worker futuro.

### `PageLayout` / `PageBlock` (CMS)

Arquivos: [`PageLayout.ts`](../packages/domain/src/entities/PageLayout.ts), [`PageBlock.ts`](../packages/domain/src/entities/PageBlock.ts).

**PageLayout:** `id`, `slug`, `title`, `status` (`PageStatus`), `seoTitle?`, `seoDescription?`, `publishedAt?`, `updatedAt`.

**PageBlock:** `id`, `pageId`, `type` (`BlockType`), `sortOrder`, `props` (JSON), `visibility` (`BlockVisibility`).

### `PriceSnapshot`

Snapshot pontual de preço para histórico/gráfico.

### `PriceAlert`

Alerta de queda com double opt-in: `pending` → `active` → `triggered` | `expired`.

### `WishlistItem`

Item por `sessionId` anônimo + `productId` + `marketplace` + `sortOrder`.

### `ContentArticle` / `CuratedCollection`

Arquivo: [`ContentArticle.ts`](../packages/domain/src/entities/ContentArticle.ts).

**ContentArticle:** `slug`, `title`, `body`, `type` (`ArticleType`), `status`, `seo`, `embeds[]`, `publishedAt?`.

**ContentProductEmbed:** `productId`, `position`, `variant` (`inline` | `highlight` | `comparison`).

**CuratedCollection:** `slug`, `title`, `description`, `coverImageUrl`, `campaignOrigin`, `utmDefaults`, `productIds[]`, `ctaText`.

### `Coupon`

Cupom verificado pelo Pipeline D; status `unverified` até confirmação.

### `ProductComparison`

Comparador 2–3 produtos: `shareToken`, `sessionId`, `editorialIntro`, produtos ordenados.

## Value objects

Arquivo: [`packages/domain/src/value-objects/index.ts`](../packages/domain/src/value-objects/index.ts).

| VO | Regras |
|----|--------|
| `ProductId` | UUID v4 |
| `Slug` | `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` |
| `Price` | `amount >= 0`, `currency` BRL/USD, `isStale`, `updatedAt`; métodos `meetsTarget()`, `droppedByPercent()`, `withStale()` |
| `Email` | formato válido, normalizado lowercase |
| `AffiliateLink` | URL HTTPS |

## Enums

Arquivo: [`packages/domain/src/enums/index.ts`](../packages/domain/src/enums/index.ts), CMS em [`cms.ts`](../packages/domain/src/enums/cms.ts).

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
| `ClickOrigin` | `listagem`, `detalhe`, `embed`, `comparador`, `cupons` |
| `AffiliateAccountStatus` | `pending_manual_validation`, `active`, `suspended` |
| `BlockType` | 11 tipos CMS — ver [cms-home-phase1.md](./cms-home-phase1.md), [cms-dynamic-blocks-phase2.md](./cms-dynamic-blocks-phase2.md) |
| `PageStatus` | `draft`, `published` |
| `BlockVisibility` | `all`, `desktop`, `mobile` |
| `ProductSortField` | `editorial_score`, `price_updated_at`, `created_at`, `price_asc`, `price_desc` |

Parsers: [`packages/domain/src/enums/parsers.ts`](../packages/domain/src/enums/parsers.ts) — `parseMarketplace()`, `parseProductSortField()`.

## Eventos de domínio

| Evento | Quando | Handler |
|--------|--------|---------|
| `PriceDropped` | Preço do produto cai | Fila `domain_events` → alertas/email |

Mensagens: [`packages/domain/src/events/messages.ts`](../packages/domain/src/events/messages.ts).

## Ports — repositórios

Interfaces em [`packages/domain/src/repositories/`](../packages/domain/src/repositories/).

### `ProductRepository`

```typescript
interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: Slug | string): Promise<Product | null>;
  findByExternalId(marketplace: Marketplace, externalId: string): Promise<Product | null>;
  findPublished(filters: ProductListFilters): Promise<{ items: Product[]; total: number }>;
  findByIds(ids: string[]): Promise<Product[]>;
  findDueForPriceRefresh(criteria: RefreshCriteria): Promise<Product[]>;
  findDueForCatalogSync(criteria: RefreshCriteria): Promise<Product[]>;
  save(product: Product): Promise<void>;
  saveBatch(products: Product[]): Promise<void>;
}
```

`ProductListFilters`: `page?`, `pageSize?`, `categoryIds?`, `marketplace?`, `sort?`.

### `CategoryRepository`

CRUD + `getDescendantIds`, `getAncestorChain`, contagens por subárvore. Ver [categories-hierarchy.md](./categories-hierarchy.md).

### `PageRepository`

```typescript
type PublishedPageResult = { layout: PageLayout; blocks: PageBlock[] };

interface PageRepository {
  findPublishedBySlug(slug: string): Promise<PublishedPageResult | null>;
}
```

### `WishlistRepository`

```typescript
interface WishlistRepository {
  findBySessionId(sessionId: string): Promise<WishlistItem[]>;
  add(item: WishlistItem): Promise<void>;
  remove(id: string, sessionId: string): Promise<void>;
  countBySessionAndMarketplace(sessionId: string, marketplace: Marketplace): Promise<number>;
}
```

### `PriceAlertRepository`

`findByConfirmToken`, `countActiveByEmail`, `findActiveForProduct`, `updateStatus`, etc.

### `ContentRepository`

`findArticleBySlug`, `findCollectionBySlug`.

### `CouponRepository`

`findActiveVerified`, `findByMarketplace`, `findDueForVerification`.

### `ProductComparisonRepository` / `ClickEventRepository` / `SyncJobLogRepository`

Comparador por `shareToken`, registro de cliques, logs de sync.

## Ports — gateways

Arquivo: [`packages/domain/src/gateways/index.ts`](../packages/domain/src/gateways/index.ts).

| Interface | Responsabilidade | Implementação |
|-----------|------------------|---------------|
| `MarketplaceFetcher` | fetch produto(s) externo | `apps/worker` |
| `MarketplaceFetcherFactory` | strategy por marketplace | infrastructure |
| `AffiliateLinkBuilder` | deep link + batch checkout | `default-affiliate-link.builder` |
| `EmailSender` | envio transacional | Resend adapter |
| `CacheStore` | get/set/TTL/version | Redis |
| `CacheInvalidator` | invalidação pós-write | Redis INCR version |
| `EventBus` | publicar domain events | BullMQ `domain_events` |

## Use cases (`packages/application`)

| Use case | Arquivo | Consumido por |
|----------|---------|---------------|
| `GetPublishedPageLayout` | `use-cases/page/` | API `GET /pages/:slug` |
| `ListProducts` | `use-cases/product/` | API `GET /products` |
| `GetProductBySlug` | `use-cases/product/` | API `GET /products/:slug` |
| `ListCategoryTree` / `GetCategoryBySlug` | `use-cases/category/` | API `GET /categories`, `GET /categories/:slug` |
| `ListAdminCategories` / `CreateCategory` / `UpdateCategory` / `DeleteCategory` | `use-cases/admin-category/` | API admin categorias |
| `GetProductPriceHistory` | `use-cases/product/` | API price-history |
| `GetWishlist` / `AddToWishlist` / `BuildBatchCheckoutRedirect` | `use-cases/wishlist/` | API wishlist |
| `CreatePriceAlert` / `ConfirmPriceAlert` | `use-cases/alert/` | API alertas |
| `GetArticleWithEmbeds` / `GetCuratedCollection` | `use-cases/content/` | API conteúdo |
| `ListActiveCoupons` | `use-cases/coupon/` | API cupons |
| `CreateComparison` / `GetComparisonByToken` | `use-cases/comparison/` | API comparador |
| `RecordClickEvent` | `use-cases/events/` | API `POST /events/click` |
| `SyncCatalogBatch` / `UpdatePricesBatch` / `RunHygienePipeline` / `VerifyCouponsBatch` | `use-cases/sync/` | Worker |

Export completo: [`packages/application/src/index.ts`](../packages/application/src/index.ts).

## Erros de domínio

`DomainError` e `ValidationError` em [`packages/domain/src/errors/DomainError.ts`](../packages/domain/src/errors/DomainError.ts) — mapeados para HTTP 400 na API.
