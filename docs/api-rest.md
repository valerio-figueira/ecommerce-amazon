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

Lista verticais com contagem de produtos publicados.

**Response:**

```typescript
{
  items: Array<{
    slug: string;    // ex.: "home-office"
    label: string;   // ex.: "Home Office"
    count: number;
  }>;
}
```

Use case: `ListProductCategories`.

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
| `category` | string | — | `category_vertical` |
| `marketplace` | `amazon_br` \| `shopee_br` | — | |
| `sort` | `editorial_score` \| `price_updated_at` | `editorial_score` | |

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
  canonicalUrl?: string;
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

> Nota: `DELETE /price-alerts/:token` está no plano MVP mas **não implementado** na rota atual.

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

### `POST /wishlist/checkout-batch`

**Body:** `{ marketplace: 'amazon_br' | 'shopee_br' }`

**Response:** URL de redirect agrupado (batch checkout) — gerado por `AffiliateLinkBuilder`.

---

## Conteúdo

### `GET /articles/:slug`

Artigo publicado com embeds resolvidos (produtos do catálogo local).

### `GET /collections/:slug`

Coleção curada com produtos ordenados + metadados UTM.

---

## Cupons

### `GET /coupons`

Cupons ativos verificados.

**Response:** `{ items: Coupon[] }`

> `GET /coupons/:marketplace` está no plano mas **não registrado** — filtrar client-side ou implementar.

---

## Comparador

### `GET /comparisons/:shareToken`

Comparador persistido por token de compartilhamento.

### `POST /comparisons`

**Body (`CreateComparisonSchema`):**

```typescript
{
  productIds: string[];     // 2–3 uuids
  editorialIntro: string;   // mín. 150 caracteres
}
```

**Response 201:** inclui `shareToken` para URL pública.

---

## Telemetria

### `POST /events/click`

**Body (`RecordClickSchema`):**

```typescript
{
  productId: string;
  origin: 'listagem' | 'detalhe' | 'embed' | 'comparador' | 'cupons' | 'redirect_go';
  sessionId?: string;
  blockId?: string;
}
```

**Response:** 204

Persistido em `click_events`. Redirect `/go` usa origem `redirect_go` automaticamente.

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
| `WishlistAddSchema` | POST /wishlist |
| `WishlistRemoveParamsSchema` | DELETE |
| `BatchCheckoutSchema` | checkout-batch |
| `CreateComparisonSchema` | POST /comparisons |
| `ComparisonTokenParamsSchema` | GET comparisons |
| `RecordClickSchema` | POST /events/click |
| `ArticleSlugParamsSchema` | GET /articles |
| `CollectionSlugParamsSchema` | GET /collections |
| `PageSlugParamsSchema` | GET /pages |

## Schemas web (client)

Espelho parcial para parse no browser: [`apps/web/src/lib/api/schemas.ts`](../apps/web/src/lib/api/schemas.ts).

Client HTTP: [`apps/web/src/lib/api/client.ts`](../apps/web/src/lib/api/client.ts) — `apiFetch`, `apiFetchParsed`, `x-session-id`.

## Rotas planejadas (não implementadas)

| Rota | Plano |
|------|-------|
| `DELETE /price-alerts/:token` | PRD Core |
| `GET /coupons/:marketplace` | PRD Core |
| `POST/PATCH /admin/pages/*` | UI Home fase Admin |

## CORS

[`packages/shared/src/cors.ts`](../packages/shared/src/cors.ts) — `CORS_ORIGINS` + localhost/LAN em development. Ver [dev-setup.md](./dev-setup.md).
