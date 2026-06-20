# Skeletons de loading — vitrine web

## O quê

Feedback visual de carregamento durante navegação entre rotas em `apps/web`, via `loading.tsx` do App Router, **Suspense granular** em páginas de listagem/editorial, header estável com cache, barra de progresso client-side e componentes skeleton que espelham o layout de cada tipo de página.

**Fora de escopo:** admin.

## Por quê

Sem feedback imediato, o App Router mantém a página anterior visível até o Server Component da nova rota terminar o fetch — sensação de “freeze” ao clicar em links.

**Causas raiz (resolvidas em duas fases):**

1. **Layout async sem Suspense** — `SiteHeaderShell` bloqueava `loading.tsx` do segmento filho (Fase 1).
2. **`page.tsx` async bloqueante** — `await Promise.all([...])` no nível da página impedia streaming parcial; shell (breadcrumb, título) só aparecia quando o grid também estava pronto (Fase 2 — streaming granular).

Planos de referência:

- [`.cursor/plans/web_instant_navigation_ux_b96daa6b.plan.md`](../.cursor/plans/web_instant_navigation_ux_b96daa6b.plan.md) — Fase 1
- Streaming granular — `page.tsx` síncrono + boundaries `<Suspense>` por seção lenta

## Como funciona

### Navegação entre rotas

```mermaid
sequenceDiagram
  participant User
  participant Link
  participant Bar as NavigationPendingBar
  participant Shell as RootLayout
  participant Loading as loading.tsx
  participant Page as page.tsx sync

  User->>Link: click
  Link->>Bar: barra no topo
  Link->>Shell: navegação client
  Note over Shell: header cacheado (unstable_cache)
  Shell->>Loading: skeleton leve em children
  Page->>Page: shell streama via Suspense
  Page->>Shell: grid substitui skeleton parcial
  Bar->>Bar: oculta ao mudar pathname
```

### Streaming granular (categorias, artigos)

```mermaid
sequenceDiagram
  participant Page as page.tsx sync
  participant Shell as CategoryShell
  participant Grid as CategoryProductsGrid
  participant API

  Page-->>User: layout + fallbacks imediatos
  par Shell
    Shell->>API: getCategory
    Shell-->>User: breadcrumb + h1 + pills
  and Grid
    Grid->>API: getCategoryProducts
    Grid-->>User: ProductCards
```

- **`page.tsx` síncrono** retorna JSX com `<Suspense fallback={...}>` por seção.
- Fetches lentos ficam em **Server Components filhos async** (`CategoryProductsGrid`, `ArticleListingGridSection`, etc.).
- O **root layout** envolve `SiteHeaderShell` em `<Suspense fallback={<HeaderSkeleton />}>`.
- `getCachedCategoryNavTree()` / `getCachedCategoryTree()` usam `unstable_cache` (revalidate 600s) — header e sidebar não re-suspendem a cada clique.
- `NavigationPendingBar` reage ao clique em links internos antes da resposta do servidor.
- Fetches compartilhados entre `generateMetadata` e RSC filhos usam `React.cache()` em [`cached-fetchers.ts`](apps/web/src/lib/api/cached-fetchers.ts).

### Mapa rota → loading / Suspense

| Rota                 | `loading.tsx`                   | Streaming interno                                                                             |
| -------------------- | ------------------------------- | --------------------------------------------------------------------------------------------- |
| `/` (home)           | `HomePageSkeleton`              | Blocos `PRODUCT_GRID` / `FEATURED_PRODUCT` com prefetch server + `initialData` no React Query |
| `/categorias/[slug]` | Header + grid leve              | `CategoryShell`, `CategorySidebar`, `CategoryProductsGrid`, `CategoryDescription`             |
| `/artigos`           | Toolbar + grid                  | `ArticleListingToolbarSection`, `ArticleListingGridSection`                                   |
| `/artigos/[slug]`    | Hero + corpo                    | `ArticleDetailMain`; auto-links em Suspense separado                                          |
| `/colecoes/[slug]`   | `CollectionPageSkeleton` (leve) | API monolítica — sem split                                                                    |
| `/produtos/[slug]`   | `ProductDetailSkeleton` (leve)  | API monolítica — sem split                                                                    |
| `/sobre`             | `InstitutionalPageSkeleton`     | —                                                                                             |

`/artigos/categoria/[slug]` é redirect server-side — sem `loading.tsx`.  
`/contato` e `/legal` são sync — sem skeleton necessário.

### Filtros de artigos (mesma rota)

Em `/artigos`, filtros e paginação usam `router.replace` na mesma rota. `ArticleListingPendingProvider` + `ArticleListingGrid` exibem `ArticleCardSkeleton` na grid durante `useTransition`, enquanto a toolbar permanece interativa.

## Arquivos-chave

| Área                               | Path                                                                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout + Suspense header           | `apps/web/src/app/layout.tsx`                                                                                                                   |
| Cache árvore categorias            | `apps/web/src/lib/api/categories.ts`                                                                                                            |
| Categoria — shell / grid / sidebar | `apps/web/src/components/category/*.tsx`                                                                                                        |
| Artigos — streaming                | `apps/web/src/components/articles/ArticleListing*Section.tsx`, `ArticleDetailMain.tsx`                                                          |
| Home — prefetch server             | `ProductGridBlockServer.tsx`, `FeaturedProductBlockServer.tsx`                                                                                  |
| Fetches deduplicados               | `apps/web/src/lib/api/cached-fetchers.ts`                                                                                                       |
| Helpers listagem                   | `apps/web/src/lib/api/category-products.ts`, `product-grid.ts`, `auto-links.ts`                                                                 |
| Barra de progresso                 | `apps/web/src/components/navigation/NavigationPendingBar.tsx`                                                                                   |
| Skeletons granulares               | `CategoryHeaderSkeleton`, `CategorySidebarSkeleton`, `ArticleListingToolbarSkeleton`, `ArticleListingGridSkeleton`, `ArticleDetailHeroSkeleton` |
| Route loading                      | `apps/web/src/app/**/loading.tsx`                                                                                                               |

## Cache da home

`fetchPageLayout` usa `next: { revalidate: 60 }`. A home exporta `revalidate = 60`. Blocos de produto recebem dados iniciais do servidor (`initialProducts` / `initialProduct`) para evitar segundo skeleton pós-hidratação. Invalidação on-demand via `POST /api/revalidate` com `REVALIDATE_SECRET`.

## Dev vs produção

- **Dev:** compilação sob demanda + ícone "N" do Next.js → skeleton pode ficar visível por mais tempo; isso é normal.
- **Produção:** `revalidate` em rotas públicas → muitas transições são rápidas; shell pode aparecer antes do grid.

## Como testar

1. Subir API e web: ver [dev-setup.md](./dev-setup.md).
2. Navegar: home → categoria → produto → coleção → artigos → artigo → sobre.
3. **Critério:** skeleton imediato; em categorias, breadcrumb/título aparecem **antes** do grid de produtos; header não pisca entre cliques.
4. Home: blocos de produto sem flash de skeleton após hidratação na primeira visita.
5. Em `/artigos`, filtrar categoria → grid em skeleton via `useTransition`.
6. Footer → `/sobre` → skeleton institucional imediato.

```bash
npm run lint --workspace=apps/web
```

## Próximos passos (não implementados)

- Segment `error.tsx` por rota de catálogo/editorial.
- Split de fetch em coleção/produto se a API passar a expor metadados e itens em endpoints separados.
