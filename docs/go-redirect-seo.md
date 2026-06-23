# Redirect `/go`, JSON-LD e interlinkagem

Mascaramento de links afiliados, rich snippets Schema.org e motor de links internos em artigos.

| Referência     | Arquivo                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Rota API       | `GET /go/:slug` em [`apps/api/src/adapters/http/routes/index.ts`](../apps/api/src/adapters/http/routes/index.ts) |
| Use case       | [`ResolveAffiliateRedirect.ts`](../packages/application/src/use-cases/affiliate/ResolveAffiliateRedirect.ts)     |
| LinkParser     | [`packages/shared/src/seo/link-parser.ts`](../packages/shared/src/seo/link-parser.ts)                            |
| Página produto | [`apps/web/src/app/produtos/[slug]/page.tsx`](../apps/web/src/app/produtos/[slug]/page.tsx)                      |

## Escopo entregue

- `GET /go/:slug` na API com **307** para URL de afiliado parametrizada
- `GET /go/alink/:id` para auto-links com URL de afiliado externa (HTTPS) cadastrada manualmente
- Rewrite Next.js `/go/:slug` → API (`API_INTERNAL_URL`)
- Telemetria `redirect_go` via `RecordClickEvent` (fire-and-forget)
- `goUrl` nos DTOs públicos (substitui `affiliateUrl` exposto ao front)
- `AffiliateAccountRepository` lê `affiliate_accounts`; bloqueia `pending_manual_validation`
- JSON-LD `Product` na página `/produtos/[slug]` (sem `offers` se preço stale)
- `injectInternalLinks` aplicado em `GetArticleWithEmbeds`
- Dicionário estático `SEO_KEYWORD_MAP` em shared

## Fora de escopo

- Página `/artigos/[slug]` no Next.js (interlinkagem já na API)
- Tabela DB `seo_keywords`
- Fila assíncrona dedicada para cliques

## Fluxo `/go`

1. CTA aponta para `/go/{slug}?blockId=&sessionId=`
2. Next.js faz rewrite para a API
3. `ResolveAffiliateRedirect` valida produto + conta afiliado
4. `RecordClickEvent` com origem `redirect_go`
5. Resposta **307**:
   - **Amazon:** URL persistida em `products.affiliate_deep_link` (link SiteStripe com `tag` do operador) com `ascsubtag` de telemetria via `appendTrackingToStoredUrl` — **não** é substituída por `/dp/{ASIN}` reconstruído
   - **Shopee:** URL reconstruída via `AffiliateLinkBuilder.buildWithTracking` (tag da conta + subIDs)
   - **Mercado Livre:** URL persistida em `products.affiliate_deep_link` (ex.: `meli.la/...`) com UTMs de telemetria via `appendTrackingToStoredUrl` — o link gerado no portal de afiliados **não** é substituído por `produto.mercadolivre.com.br/{externalId}`

Falha (produto inexistente, conta pending): **307** para `/`.

## JSON-LD

Builder: [`buildProductJsonLd`](../packages/shared/src/seo/product-json-ld.ts)

- `url` aponta para a URL canônica da página (`resolveProductCanonicalUrl`)
- `offers.url` sempre aponta para `{SITE_URL}/go/{slug}` (CTA afiliado mascarado)
- `offers` omitido quando `shouldShowPrice === false`

## Canonical (`<link rel="canonical">`)

Helper: [`resolveProductCanonicalUrl`](../packages/shared/src/seo/product-canonical.ts)

### 1. Banco — como nasce

- Coluna `products.canonical_url`: `varchar(512)`, **nullable**, sem valor no cadastro admin
- `CreateProduct` **não** envia `canonicalUrl` → PostgreSQL grava `NULL`
- Override editorial só via SQL / Drizzle Studio (cenários avançados de SEO)

### 2. Frontend — como se preenche sozinho

Na renderização de `/produtos/[slug]`, o Next.js aplica:

```
SE canonical_url no banco ≠ NULL  →  usa a URL do banco (exceção)
SENÃO                           →  {NEXT_PUBLIC_SITE_URL}/produtos/{slug} (padrão)
```

Implementação: `generateMetadata` e JSON-LD chamam `resolveProductCanonicalUrl(slug, siteBaseUrl, product.canonicalUrl)`.

- Página produto: [`apps/web/src/app/produtos/[slug]/page.tsx`](../apps/web/src/app/produtos/[slug]/page.tsx) — tag **sempre** emitida via `metadata.alternates.canonical`
- Home: [`apps/web/src/app/page.tsx`](../apps/web/src/app/page.tsx) — canonical = `NEXT_PUBLIC_SITE_URL`
- Admin: sem input no formulário; operador leigo nunca vê o campo

## Interlinkagem

Config: [`SEO_KEYWORD_MAP`](../packages/shared/src/seo/keywords.ts)

- Primeira ocorrência por keyword por artigo
- Não altera links `<a>` existentes

## Como testar

```bash
npm run build -w @ecommerce-amazon/shared -w @ecommerce-amazon/application -w @ecommerce-amazon/api -w @ecommerce-amazon/web
curl -I "http://localhost:3000/go/cadeira-ergonomica-home-office"
curl "http://localhost:3000/products/cadeira-ergonomica-home-office" | jq .goUrl
curl "http://localhost:3000/articles/guia-cadeira-ergonomica" | jq .article.body
```

Abrir `http://localhost:3001/produtos/cadeira-ergonomica-home-office` e inspecionar `<script type="application/ld+json">`.

## Checklist `rel` em links comerciais

Todo CTA que aponta para `/go/{slug}` deve usar **`rel="noopener sponsored"`** (regra de conformidade afiliado).

| Componente                                                                      | Status                                                                             |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [`AffiliateGoLink.tsx`](../apps/web/src/components/product/AffiliateGoLink.tsx) | Conforme — único wrapper de CTA afiliado                                           |
| [`WishlistDrawer.tsx`](../apps/web/src/components/wishlist/WishlistDrawer.tsx)  | Conforme — usa `AffiliateGoLink`                                                   |
| Grep `/go/` em `apps/web`                                                       | Deve retornar apenas `AffiliateGoLink`, `go-url.ts`, `robots.ts`, `next.config.ts` |

Auditoria periódica:

```bash
rg 'href=.*/go/' apps/web/src --glob '*.tsx'
rg 'window\.open.*go' apps/web/src
```

Ver também [seo-technical-phase1.md](./seo-technical-phase1.md) para `robots.txt` (`Disallow: /go/`).

## Env vars

| Variável                                       | Uso                                                       |
| ---------------------------------------------- | --------------------------------------------------------- |
| `API_INTERNAL_URL`                             | Rewrite `/go` no Next.js (default: `NEXT_PUBLIC_API_URL`) |
| `NEXT_PUBLIC_SITE_URL`                         | URLs absolutas no JSON-LD                                 |
| `AMAZON_AFFILIATE_TAG` / `SHOPEE_AFFILIATE_ID` | Fallback quando conta DB ausente (Amazon/Shopee)          |

**Mercado Livre:** o operador cola o link `meli.la` (ou URL social) no cadastro do produto; o redirect `/go` usa esse valor persistido. Tag ML via env/DI ainda não aplicável (Fase 3 OAuth).
