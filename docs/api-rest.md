# API REST — contrato completo

Implementação: [`apps/api/src/adapters/http/routes/index.ts`](../apps/api/src/adapters/http/routes/index.ts).

Regras: [`.cursor/rules/03-api-rest.mdc`](../.cursor/rules/03-api-rest.mdc). Plano: [PRD Core §5](../.cursor/plans/prd_plataforma_afiliação_de44933f.plan.md).

**Base URL dev:** `http://localhost:3000` (`API_PORT`).

## Princípios

- Leitura do catálogo local + escrita de alertas, wishlist, comparações, eventos
- **Zero** chamada a marketplace no request do visitante
- Validação Zod na borda → use case → presenter
- Sessão anônima: header `x-session-id` (wishlist, batch checkout, comparisons)

## Fluxo de erro

| Status | Causa |
|--------|-------|
| 400 | `ZodError`, `ValidationError`, `DomainError` |
| 404 | Recurso não encontrado / não publicado |
| 500 | Erro inesperado |
| 204 | Sucesso sem corpo (`DELETE`, `POST /events/click`) |

## Health

### `GET /health`

```json
{ "status": "ok" }
```

---

## Categorias

### `GET /categories`

Árvore hierárquica de categorias visíveis com contagem de produtos na subárvore.

**Response:**

```typescript
{
  items: Array<{
    slug: string;
    label: string;
    icon?: string;
    productCount: number;
    subcategories?: /* recursivo */;
  }>;
}
```

Use case: `ListCategoryTree`.

### `GET /categories/:slug`

Detalhe SEO da categoria para página `/categorias/{slug}`.

**Response:**

```typescript
{
  slug: string;
  label: string;
  seoTitle?: string;
  seoDescription?: string;
  descriptionHtml?: string;
  productCount: number;
  breadcrumbs: Array<{ slug: string; label: string }>;
  children: Array<{ slug: string; label: string; productCount: number }>;
}
```

Use case: `GetCategoryBySlug`.

---

## CMS — páginas

### `GET /pages/:slug`

Retorna layout **publicado** ou 404.

**Params:** `slug` — ex.: `home`

**Response:** `PageLayoutDto` ([`packages/shared/src/cms/block-schemas.ts`](../packages/shared/src/cms/block-schemas.ts))

```typescript
{
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  blocks: Array<{
    id: string;           // uuid
    type: BlockType;      // ver cms-home-phase1.md
    sortOrder: number;
    visibility: 'all' | 'desktop' | 'mobile';
    props: unknown;       // validado por Zod por tipo no use case
  }>;
}
```

Cache Redis: chave `vitrine:page:slug:{slug}`, TTL 300s.

---

## Produtos

### `GET /products`

**Query (Zod `ListProductsQuerySchema`):**

| Param | Tipo | Default | Notas |
|-------|------|---------|-------|
| `page` | int > 0 | 1 | |
| `pageSize` | int ≤ 100 | 20 | |
| `category` | string | — | Filtra subárvore via `category_id` (slug + descendentes) |
| `marketplace` | `amazon_br` \| `shopee_br` | — | |
| `sort` | `editorial_score` \| `price_updated_at` | `editorial_score` | |
| `visibleOnly` | `true` \| `false` | — | Quando `search` é informado, default `true` |
| `search` | string (max 100) | — | `ilike` em `titleClean`, `titleRaw`, `slug` |

**Response:**

```typescript
{
  items: ProductListItemDto[];
  total: number;
  page: number;
  pageSize: number;
}
```

### `ProductListItemDto` / `ProductPriceDto`

Presenter: [`apps/api/src/adapters/presenters/product.presenter.ts`](../apps/api/src/adapters/presenters/product.presenter.ts)

```typescript
type ProductPriceDto = {
  amount: number | null;   // null se isStale
  currency: string;
  isStale: boolean;
  updatedAt: string;       // ISO 8601
  strikethrough?: number;
};

type ProductListItemDto = {
  id: string;
  slug: string;
  title: string;           // titleClean
  price: ProductPriceDto;
  marketplace: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;       // primeira imagem
  goUrl: string;           // /go/{slug} — mascaramento afiliado
};
```

### `GET /go/:slug`

Redirect **307** para URL de afiliado com tracking. Query opcional: `blockId`, `sessionId`.

- Produto inexistente ou conta `pending_manual_validation` → **307** `/`
- Dispara telemetria `redirect_go` (assíncrono, não bloqueia redirect)

Ver [go-redirect-seo.md](./go-redirect-seo.md).

### `GET /products/:slug`

**Response:** `ProductDetailDto` = `ProductListItemDto` +

```typescript
{
  titleRaw: string;
  externalId: string;
  availability: string;
  shortDescription?: string;
  longDescriptionHtml?: string;
  images: string[];
  specs: Record<string, string>;
  pros?: string[];
  cons?: string[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string; // editorial override; omit when null
}
```

### `GET /products/:id/price-history`

**Params:** `id` uuid  
**Query:** `days` (1–365, default 90)

**Response:**

```typescript
{
  snapshots: Array<{
    amount: number;
    currency: string;
    capturedAt: string;
  }>;
  days: number;
}
```

---

## Alertas de preço

### `POST /price-alerts`

**Body (`CreatePriceAlertSchema`):**

```typescript
{
  email: string;      // email válido
  productId: string;  // uuid
  targetPrice: number; // positivo
}
```

**Response 201:** alerta criado (status `pending`, email de confirmação via worker).

**Response 400:** limite de alertas, produto stale, etc.

### `POST /price-alerts/confirm/:token`

**Response 200:** `{ confirmed: true }`

### `DELETE /price-alerts/:token`

Cancela alerta pelo `confirmToken` (LGPD). Status → `expired`. Idempotente se já expirado ou disparado.

**Response:** 204

**Response 400:** token inválido

---

## Wishlist

Header obrigatório para identificar sessão: `x-session-id`. Se ausente, API gera UUID efêmero (não persiste cookie — responsabilidade do web).

### `GET /wishlist`

**Response:**

```typescript
{
  items: Array<{
    id: string;
    productId: string;
    marketplace: string;
    sortOrder: number;
    addedAt: string;
    product: {
      slug: string;
      title: string;
      imageUrl?: string;
      price: { amount: number | null; currency: string; isStale: boolean };
      goUrl: string;
    };
  }>;
}
```

Tipo: `WishlistItemEnriched` em [`GetWishlist.ts`](../packages/application/src/use-cases/wishlist/GetWishlist.ts).

### `POST /wishlist`

**Body:** `{ productId: string }` (uuid)  
**Response 201:** item criado.

### `DELETE /wishlist/:id`

**Params:** `id` uuid do item  
**Response:** 204

### `DELETE /wishlist`

Remove **todos** os itens da sessão identificada por `x-session-id`.

**Response:** 204

### `POST /wishlist/checkout-batch`

**Body:** `{ marketplace: 'amazon_br' | 'shopee_br' }`

**Response:** URL de redirect agrupado (batch checkout) — gerado por `AffiliateLinkBuilder`.

---

## Conteúdo

### `GET /articles`

Lista artigos **publicados** com filtros opcionais.

**Query:** `category` (slug editorial), `search` (título/resumo), `page` (default 1), `limit` (default 12, máx. 50)

**Response:** `{ items: PublishedArticleListItem[], total, page, limit }` — cada item inclui `excerpt` e `category` nullable.

**Legado:** `GET /articles?category={slug}` sem demais query params mantém resposta `{ category, items }` (usado por integrações antigas).

### `GET /article-categories`

Categorias editoriais com ao menos um artigo publicado.

**Response:** `{ items: [{ name, slug }] }`

### `GET /articles/:slug`

Artigo **publicado** com body cru (sem auto-linking). Shortcodes `[[product:slug]]` e `[[compare:slug-1,slug-2]]` permanecem no HTML; a vitrine resolve embeds e auto-links.

**Response:** `ArticlePublicDetail` — `slug`, `title`, `excerpt`, `coverImageUrl`, `body`, `type`, `seoTitle`, `seoDescription`, `author` (`{ name, avatarUrl, bio }`), `category` (`{ name, slug }`), `relatedArticles` (até 3), `publishedAt`, `embeddedProducts` (`Record<slug, ProductPublicDetail | null>` — produtos referenciados em shortcodes, com preço stale aplicado), `cluster` (`ArticleClusterPublic | null` — Hub & Spoke; ver [content-clusters-hub-spoke.md](./content-clusters-hub-spoke.md))

### `GET /seo/auto-links`

Keywords ativas para interlinking contextual (cache 1 h).

**Response:** `{ items: [{ keyword, targetUrl, maxMatches }] }`

### `GET /collections`

Lista resumida de coleções (picker CMS).

**Response:** `{ items: [{ slug, title, coverImageUrl }] }`

### `GET /collections/:slug`

Coleção curada com produtos ordenados + metadados UTM.

**Query:** `page` (default 1), `pageSize` (default 24, máx. 100)

**Response:** `CuratedCollectionDto` — `{ collection: {...}, products: ProductListItemDto[], total, page, pageSize }`

### Admin — `/admin/collections`

| Método | Rota | Body / response |
|--------|------|-----------------|
| `GET` | `/admin/collections` | `{ items: AdminCollectionSummary[] }` |
| `GET` | `/admin/collections/:id` | `AdminCollection` |
| `POST` | `/admin/collections` | `CreateCollectionBody` → `{ id }` |
| `PATCH` | `/admin/collections/:id` | `UpdateCollectionBody` → `204` |
| `DELETE` | `/admin/collections/:id` | `204` |

### Admin — `/admin/articles`

| Método | Rota | Body / response |
|--------|------|-----------------|
| `GET` | `/admin/articles` | `{ items: AdminArticleSummary[] }` — query `?status=` ou `?picker=true` |
| `GET` | `/admin/articles/:id` | `AdminArticleDetail` |
| `POST` | `/admin/articles` | `CreateArticleBody` → `{ id }` |
| `PATCH` | `/admin/articles/:id` | `UpdateArticleBody` → `204` |
| `DELETE` | `/admin/articles/:id` | `204` |

### Admin — `/admin/article-categories`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/admin/article-categories` | `{ items: ArticleCategorySummary[] }` |
| `POST` | `/admin/article-categories` | `CreateArticleCategoryBody` → `{ id }` |
| `PATCH` | `/admin/article-categories/:id` | `UpdateArticleCategoryBody` → `204` |
| `DELETE` | `/admin/article-categories/:id` | `204` (409 se categoria tiver artigos) |

`CreateArticleBody` / `UpdateArticleBody` incluem `categoryId` e `clusterId` opcionais.

### Admin — `/admin/content-clusters`

Doc: [content-clusters-hub-spoke.md](./content-clusters-hub-spoke.md).

| Método | Rota | Body / response |
|--------|------|-----------------|
| `GET` | `/admin/content-clusters` | `{ items: ContentClusterAdminSummary[] }` |
| `POST` | `/admin/content-clusters` | `CreateContentClusterBody` → `{ id }` |
| `GET` | `/admin/content-clusters/:id` | Detail + members |
| `PATCH` | `/admin/content-clusters/:id` | `UpdateContentClusterBody` → `204` |
| `DELETE` | `/admin/content-clusters/:id` | `204` |

Mutações invalidam cache `vitrine:article:slug:*` dos membros afetados.

### Admin — `/admin/auto-links`

Doc: [auto-links-admin.md](./auto-links-admin.md).

| Método | Rota | Body / query | Resposta |
|--------|------|--------------|----------|
| `GET` | `/admin/auto-links` | `?page=&limit=&search=` | `AdminAutoLinkListResponse` |
| `POST` | `/admin/auto-links` | `CreateAutoLinkBody` | 201 `{ id }` |
| `PATCH` | `/admin/auto-links/:id` | `UpdateAutoLinkBody` (parcial) | 204 |
| `DELETE` | `/admin/auto-links/:id` | — | 204 |

Mutações invalidam cache Redis `vitrine:seo:auto-links`. Keyword duplicada → 409.

### Admin — `/admin/internal-link-targets`

Doc: [auto-links-admin.md](./auto-links-admin.md).

| Método | Rota | Query | Resposta |
|--------|------|-------|----------|
| `GET` | `/admin/internal-link-targets` | `?search=&productLimit=&selectedUrl=` | `SearchInternalLinkTargetsResponse` |

- `search` — filtra categorias, coleções, artigos e produtos (produtos/artigos exigem ≥2 caracteres)
- `productLimit` — default 20, máx. 50
- `selectedUrl` — inclui destino resolvido na resposta (útil na edição)

---

## Cupons

### `GET /coupons`

Cupons ativos verificados.

**Response:** `{ items: Coupon[] }`

> `GET /coupons/:marketplace` está no plano mas **não registrado** — filtrar client-side ou implementar.

---

## Comparador

### `GET /comparisons/:shareToken`

Comparador persistido por token de compartilhamento. Response: `comparisonPublicDetailSchema` (`shareToken`, `editorialIntro`, `createdAt`, `products[]` como `ProductDetailDto`).

### `POST /comparisons`

**Body (`CreateComparisonSchema`):**

```typescript
{
  productIds: string[];     // 2–3 uuids, mesma categoria
  editorialIntro: string;   // mín. 150 caracteres
}
```

**Response 201** (criada) ou **200** (dedupe — mesmo conjunto de produtos): `{ shareToken, id }`.

Validações: produtos existentes, mesma `categoryId`, IDs ordenados antes de persistir; `A+B` e `B+A` retornam o mesmo `shareToken`.

---

## Telemetria

### `POST /events/click`

**Body (`RecordClickSchema`):**

```typescript
{
  productId: string;
  origin: 'listagem' | 'detalhe' | 'embed' | 'comparador' | 'cupons' | 'coleção' | 'similar' | 'redirect_go';
  sessionId?: string;
  blockId?: string;
  articleId?: string;
  collectionId?: string;
  placement?: ClickPlacementValue;
  pagePath?: string;
  referrerPath?: string;
}
```

**Response:** 204

Persistido em `click_events`. O fluxo principal de CTAs grava via `GET /go/:slug` com `origin` contextual na query (um evento por clique). `POST /events/click` permanece para integrações server-side.

### `POST /events/engagement`

**Body (`recordEngagementEventSchema`):**

```typescript
{
  eventType: 'article_card_click' | 'article_page_view';
  articleId: string;
  pagePath: string;
  placement?: 'article_listing' | 'article.related' | 'cms.bento_article';
  blockId?: string;
  referrerPath?: string;
  sessionId?: string;
}
```

**Response:** 204 — persistido em `content_engagement_events`. Ver [admin-dashboard-attribution-phase2.md](./admin-dashboard-attribution-phase2.md).

---

## Admin — autenticação

Implementação: [`admin-routes.ts`](../apps/api/src/adapters/http/routes/admin-routes.ts). Doc: [admin-app-phase1.md](./admin-app-phase1.md).

Rotas `/admin/*` (exceto login/logout) exigem header `Authorization: Bearer <JWT>`.

### `POST /admin/auth/login`

**Body:** `{ "email": string, "password": string }`

**Response 200:** `{ token, operator: { id, email, name } }`

**Response 401:** credenciais inválidas ou operador inativo.

### `GET /admin/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response 200:** `{ id, email, name }` (claims do JWT, sem revalidação no DB).

### `GET /admin/auth/session`

**Headers:** `Authorization: Bearer <token>`

Confirma operador **ativo** no PostgreSQL (usado pelo admin fail-closed).

**Response 200:** `{ id, email, name }`

**Response 401:** token inválido, operador ausente ou `status !== active`

**Response 503:** indisponibilidade de infraestrutura (DB)

### `POST /admin/auth/logout`

**Response:** `204` (stateless; cookie limpo no `apps/admin`).

---

## Admin — perfil do operador

Implementação: [`admin-profile-routes.ts`](../apps/api/src/adapters/http/routes/admin-profile-routes.ts). Doc: [admin-profile-phase1.md](./admin-profile-phase1.md).

Todas as rotas exigem `Authorization: Bearer <token>`.

### `GET /admin/profile`

**Response 200:** `OperatorProfile` — `{ id, email, name, avatarUrl, bio, role, status, isManagedAvatar }`

### `PATCH /admin/profile`

**Body:** `{ name: string (1–120), bio?: string | null (≤250) }`

**Response 200:** `{ operator: OperatorProfile, token: string }` — JWT atualizado quando o nome muda.

### `POST /admin/profile/avatar`

**Body:** `multipart/form-data`, campo `avatar` (imagem ≤5 MiB; JPG/PNG/GIF/WebP)

**Response 200:** `{ avatarUrl: string, isManagedAvatar: true }`

### `DELETE /admin/profile/avatar`

**Response 200:** `{ avatarUrl: null, isManagedAvatar: false }`

---

## Admin — páginas e blocos CMS

Implementação: [`admin-cms-routes.ts`](../apps/api/src/adapters/http/routes/admin-cms-routes.ts). Doc: [admin-cms-blocks-phase2.md](./admin-cms-blocks-phase2.md).

### `GET /admin/pages`

**Response 200:** `Array<{ id, slug, title, status }>`

### `GET /admin/pages/:slug`

**Response 200:** `PageLayoutDto` — blocos ordenados por `sortOrder`, props JSON crus.

### `POST /admin/pages/:slug/blocks`

**Body:** `{ type: BlockType, position: number, props: unknown, visibility?: 'all'|'desktop'|'mobile' }`

**Response 201:** `PageBlockDto` criado. Blocos com `sortOrder >= position` são deslocados +1 em transação.

### `PATCH /admin/pages/:slug/blocks/:id`

**Body:** `{ type?, position?, props?, visibility? }` (parcial)

**Response 200:** `PageBlockDto` atualizado.

### `DELETE /admin/pages/:slug/blocks/:id`

**Response 200:** `PageBlockDto[]` — blocos restantes reindexados `[0..n-1]`.

### `PATCH /admin/pages/:slug/blocks/reorder`

**Body:** `{ blocksOrder: Array<{ blockId: uuid, position: number }> }` — posições contíguas `0..n-1`, todos os blocos da página.

**Response 200:** `PageBlockDto[]` na nova ordem.

---

## Admin — produtos

Implementação: [`admin-product-routes.ts`](../apps/api/src/adapters/http/routes/admin-product-routes.ts). Doc: [admin-products-phase1.md](./admin-products-phase1.md).

### `GET /admin/products`

**Query:** `page?`, `pageSize?` (max 100), `marketplace?` (`amazon_br` \| `shopee_br` \| `mercadolivre_br`), `sort?`

**Response 200:** lista paginada com `affiliateLink` e metadados admin (ver `adminProductListResponseSchema` em `@ecommerce-amazon/shared/admin`).

### `POST /admin/products`

**Body:** `createProductBodySchema` — link de afiliado, marketplace, externalId, título, imagens, nota editorial (0–10), prós/contras, preço, `shouldShowPrice`, `visible`, disponibilidade.

**Response 201:** `{ id, slug }`

**Response 409:** produto duplicado (`marketplace` + `externalId`).

### `GET /admin/products/:slug`

**Response 200:** `adminProductDetailSchema` — payload completo para o formulário de edição (preço bruto, `shouldShowPrice`, nota 0–10).

### `PATCH /admin/products/:slug`

**Body:** `updateProductBodySchema` (mesmo contrato do create). Marketplace e `externalId` devem permanecer iguais ao registro.

**Response 200:** `{ id, slug }`

---

## Admin — analytics

Implementação: [`admin-analytics-routes.ts`](../apps/api/src/adapters/http/routes/admin-analytics-routes.ts). Doc: [admin-dashboard-phase1.md](./admin-dashboard-phase1.md).

Query comum: `from`, `to` (ISO datetime; default últimos 30 dias).

| Rota | Response |
|------|----------|
| `GET /admin/analytics/overview` | `analyticsOverviewResponseSchema` |
| `GET /admin/analytics/clicks/by-origin` | `clicksByOriginResponseSchema` |
| `GET /admin/analytics/clicks/by-marketplace` | `clicksByMarketplaceResponseSchema` |
| `GET /admin/analytics/clicks/top-products?limit=10` | `topClickedProductsResponseSchema` |
| `GET /admin/analytics/articles/converting?limit=10` | `convertingArticlesResponseSchema` |
| `GET /admin/analytics/traffic/acquisition` | `ga4TrafficAcquisitionResponseSchema` (requer `GA4_*` env) |
| `GET /admin/analytics/ctr/by-origin` | `ctrByOriginResponseSchema` |
| `GET /admin/analytics/clicks/by-placement` | `clicksByPlacementResponseSchema` |
| `GET /admin/analytics/clicks/by-block` | `clicksByBlockResponseSchema` |
| `GET /admin/analytics/clicks/by-page` | `clicksByPageResponseSchema` |
| `GET /admin/analytics/clicks/trend-by-origin` | `clicksTrendByOriginResponseSchema` |
| `GET /admin/analytics/engagement/funnel` | `editorialFunnelResponseSchema` |

---

## Admin — configurações operacionais

Implementação: [`admin-settings-routes.ts`](../apps/api/src/adapters/http/routes/admin-settings-routes.ts). Doc: [admin-operational-settings.md](./admin-operational-settings.md).

| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/admin/affiliate-accounts` | JWT |
| POST | `/admin/affiliate-accounts` | JWT admin |
| PATCH | `/admin/affiliate-accounts/:id` | JWT admin |
| DELETE | `/admin/affiliate-accounts/:id` | JWT admin |
| GET | `/admin/operators` | JWT admin |
| POST | `/admin/operators` | JWT admin |
| PATCH | `/admin/operators/:id` | JWT admin |
| PATCH | `/admin/profile/password` | JWT |
| GET | `/admin/site-settings` | JWT |
| PATCH | `/admin/site-settings` | JWT admin |
| GET | `/admin/operational-status` | JWT |
| GET | `/admin/marketplace-credentials` | JWT |
| PUT | `/admin/marketplace-credentials/:marketplace` | JWT admin |
| DELETE | `/admin/marketplace-credentials/:marketplace` | JWT admin |
| POST | `/admin/marketplace-credentials/:marketplace/test` | JWT admin |

### Público

| Método | Rota | Response |
|--------|------|----------|
| GET | `/site-settings/public` | `publicSiteSettingsResponseSchema` |

---

## Schemas de request (referência)

Arquivo: [`apps/api/src/adapters/dtos/request/schemas.ts`](../apps/api/src/adapters/dtos/request/schemas.ts)

| Schema | Uso |
|--------|-----|
| `ListProductsQuerySchema` | GET /products |
| `ProductSlugParamsSchema` | GET /products/:slug |
| `ProductIdParamsSchema` | price-history |
| `PriceHistoryQuerySchema` | query days |
| `CreatePriceAlertSchema` | POST /price-alerts |
| `ConfirmPriceAlertParamsSchema` | confirm |
| `CancelPriceAlertParamsSchema` | DELETE /price-alerts/:token |
| `WishlistAddSchema` | POST /wishlist |
| `WishlistRemoveParamsSchema` | DELETE |
| `BatchCheckoutSchema` | checkout-batch |
| `CreateComparisonSchema` | POST /comparisons |
| `ComparisonTokenParamsSchema` | GET comparisons |
| `RecordClickSchema` | POST /events/click |
| `ArticleSlugParamsSchema` | GET /articles |
| `CollectionSlugParamsSchema` | GET /collections |
| `PageSlugParamsSchema` | GET /pages |
| `AdminLoginSchema` | POST /admin/auth/login |
| `AdminPageSlugParamsSchema` | GET/POST/PATCH /admin/pages/:slug/* |
| `AdminPageBlockParamsSchema` | PATCH/DELETE /admin/pages/:slug/blocks/:id |
| `CreatePageBlockSchema` | POST /admin/pages/:slug/blocks |
| `UpdatePageBlockSchema` | PATCH /admin/pages/:slug/blocks/:id |
| `ReorderPageBlocksSchema` | PATCH /admin/pages/:slug/blocks/reorder |

## Schemas web (client)

Espelho parcial para parse no browser: [`apps/web/src/lib/api/schemas.ts`](../apps/web/src/lib/api/schemas.ts).

Client HTTP: [`apps/web/src/lib/api/client.ts`](../apps/web/src/lib/api/client.ts) — `apiFetch`, `apiFetchParsed`, `x-session-id`.

## Rotas planejadas (não implementadas)

| Rota | Plano |
|------|-------|
| `GET /coupons/:marketplace` | PRD Core |
| `POST /admin/pages/:slug/publish` | Admin CMS draft/publish |

## CORS

[`packages/shared/src/cors.ts`](../packages/shared/src/cors.ts) — `CORS_ORIGINS` + localhost/LAN em development. Ver [dev-setup.md](./dev-setup.md).
