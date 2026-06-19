# SEO técnico — fase 1

Metadados globais, sitemap paginado, robots, JSON-LD site-wide, crawl budget e Core Web Vitals na vitrine.

| Referência | Plano |
|------------|-------|
| Especificação | [`.cursor/plans/full_platform_seo_audit_f09d3fa5.plan.md`](../.cursor/plans/full_platform_seo_audit_f09d3fa5.plan.md) |
| Links afiliados | [go-redirect-seo.md](./go-redirect-seo.md) |
| Marca / URLs | [brand-config.md](./brand-config.md) |

## Escopo entregue

### Metadados globais (`apps/web`)

- [`layout.tsx`](../apps/web/src/app/layout.tsx): `metadataBase`, `title.template`, OG/Twitter defaults via `buildRootMetadata`
- Helpers em [`packages/shared/src/seo/site-metadata.ts`](../packages/shared/src/seo/site-metadata.ts)
- Canonical limpa por pathname (`buildPageCanonical`) — query params nunca entram no canonical
- `buildFacetedListingMetadata`: `noindex, follow` em listagens facetadas (`page > 1`, sort/filtros)
- `buildNotFoundMetadata`: `noindex, nofollow` em 404 e entidades ausentes
- OG por rota: home, produto, categoria, coleção, artigo

### Crawl budget

- [`categorias/[slug]/page.tsx`](../apps/web/src/app/categorias/[slug]/page.tsx): canonical sempre `/categorias/{slug}`; noindex com `?page=2`, `?sort=`, etc.
- [`artigos/page.tsx`](../apps/web/src/app/artigos/page.tsx): canonical `/artigos`; noindex com `?page=2`, `?q=`, `?categoria=`

### Sitemap e robots

- [`robots.ts`](../apps/web/src/app/robots.ts): `Disallow: /go/`, `/api/`; `Sitemap: {SITE_URL}/sitemap.xml`
- [`sitemap.ts`](../apps/web/src/app/sitemap.ts): `generateSitemaps()` + fatias via API
- API: `GET /seo/sitemap-meta`, `GET /seo/sitemap-entries?page=N&pageSize=50000`
- Use case: [`ListSitemapEntries`](../packages/application/src/use-cases/seo/ListSitemapEntries.ts)
- Repositório: [`DrizzleSitemapRepository`](../packages/infrastructure/src/persistence/repositories/drizzle-sitemap.repository.ts)

**Política `lastmod`:** produtos usam `created_at` (sem `updated_at` na tabela); categorias, artigos e coleções usam `updated_at`. `price_updated_at` **não** entra no sitemap.

**Excluído do sitemap:** `/cupons` (sem página web), `/go/*`, URLs com query params, `/comparar/*` gerado por usuários (UGC — ver [comparator-web-phase1.md](./comparator-web-phase1.md); fase editorial com `status: published` no admin).

### JSON-LD

| Página | Schema |
|--------|--------|
| `/` | `Organization` + `WebSite` (Sitelinks Searchbox → `/artigos?q=`) |
| `/categorias/[slug]` | `BreadcrumbList`, `CollectionPage`, `ItemList` (top 10 produtos) |
| `/artigos/[slug]` | `Article` enriquecido (`dateModified`, `publisher`, `url`, cluster `ItemList`) |
| `/produtos/[slug]` | `Product` (existente) |

Builders: [`packages/shared/src/seo/site-json-ld.ts`](../packages/shared/src/seo/site-json-ld.ts)

### Core Web Vitals

- LCP: `priority` no primeiro bloco CMS (Bento hero, banner, carousel slide 0)
- Carrosséis: slides > 0 com `loading="lazy"` + `decoding="async"`
- CLS: `ProductCardSkeleton` no carousel client-fetch; `tabular-nums` em preços; badge wishlist reservado; `ProductRating` com min-height

## Arquivos-chave

```
packages/shared/src/seo/
  site-metadata.ts
  site-json-ld.ts
  sitemap-schemas.ts
apps/web/src/app/
  layout.tsx, robots.ts, sitemap.ts
  page.tsx, categorias/[slug]/page.tsx, artigos/page.tsx
apps/api/src/adapters/http/routes/index.ts  → /seo/sitemap-*
```

## Env vars

| Variável | Uso |
|----------|-----|
| `WEB_PUBLIC_URL` / `NEXT_PUBLIC_SITE_URL` | `metadataBase`, canonical, sitemap URLs |
| `NEXT_PUBLIC_API_URL` | Web → API para sitemap entries |
| `SITE_NAME` | Title template e JSON-LD Organization |

## Como testar

```bash
pnpm --filter @ecommerce-amazon/shared test
pnpm --filter @ecommerce-amazon/api test
pnpm --filter web build

# Com API + web rodando:
curl -s http://localhost:3001/robots.txt
curl -s http://localhost:3001/sitemap.xml
curl -s "http://localhost:3000/seo/sitemap-meta"
curl -s "http://localhost:3000/seo/sitemap-entries?page=1&pageSize=10"
```

Validação manual:

- View-source em `/categorias/{slug}?page=2`: canonical limpa + `robots: noindex, follow`
- [Google Rich Results Test](https://search.google.com/test/rich-results) — home, produto, artigo, categoria
- Lighthouse — LCP home e CLS em blocos CMS com fetch client-side

## Fora de escopo (fase 2)

- Página `/cupons` e entrada no sitemap
- `FAQPage` JSON-LD (sem modelo FAQ no CMS)
- SSR completo de `ProductGridBlock` (eliminar fetch client na home)
- Gate `noindex` global por conta afiliado `pending_manual_validation`
