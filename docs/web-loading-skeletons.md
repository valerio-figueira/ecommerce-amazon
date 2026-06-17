# Skeletons de loading — vitrine web

## O quê

Feedback visual de carregamento durante navegação entre rotas em `apps/web`, via `loading.tsx` do App Router, Suspense no header, barra de progresso client-side e componentes skeleton que espelham o layout de cada tipo de página.

**Fora de escopo:** blocos CMS na home (já têm loading via React Query); admin.

## Por quê

Sem feedback imediato, o App Router mantém a página anterior visível até o Server Component da nova rota terminar o fetch — sensação de “freeze” ao clicar em links.

**Causa raiz identificada:** o Next.js bloqueia a navegação quando o `layout.tsx` contém fetch async **sem** `<Suspense>`. O [`SiteHeaderShell`](apps/web/src/components/layout/SiteHeaderShell.tsx) aguardava `/categories` no layout raiz, impedindo que `loading.tsx` do segmento filho aparecesse imediatamente.

Plano de referência: [`.cursor/plans/web_instant_navigation_ux_b96daa6b.plan.md`](../.cursor/plans/web_instant_navigation_ux_b96daa6b.plan.md).

## Como funciona

```mermaid
sequenceDiagram
  participant User
  participant Link
  participant Bar as NavigationPendingBar
  participant Shell as RootLayout
  participant Loading as loading.tsx
  participant Page as page.tsx

  User->>Link: click
  Link->>Bar: barra no topo (client)
  Link->>Shell: navegação client
  Note over Shell: header em Suspense (stream ou cache)
  Shell->>Loading: skeleton imediato em children
  Page->>Page: fetch API + render RSC
  Page->>Shell: substitui skeleton pelo conteúdo
  Bar->>Bar: oculta ao mudar pathname
```

- O **root layout** envolve `SiteHeaderShell` em `<Suspense fallback={<HeaderSkeleton />}>`.
- `NavigationPendingBar` reage ao clique em links internos antes da resposta do servidor.
- Cada segmento de rota pode ter seu próprio `loading.tsx`; o mais específico prevalece.
- Skeletons usam `aria-busy="true"` no `<main>` e texto oculto `role="status"` (“Carregando…”).
- Fetches compartilhados entre `generateMetadata` e `page.tsx` usam `React.cache()` em [`cached-fetchers.ts`](apps/web/src/lib/api/cached-fetchers.ts).

### Mapa rota → skeleton

| Rota | `loading.tsx` | Componente |
|------|---------------|------------|
| Fallback (home e rotas sem skeleton específico) | `src/app/loading.tsx` | `HomePageSkeleton` |
| `/sobre` | `src/app/sobre/loading.tsx` | `InstitutionalPageSkeleton` |
| `/produtos/[slug]` | `src/app/produtos/[slug]/loading.tsx` | `ProductDetailSkeleton` |
| `/categorias/[slug]` | `src/app/categorias/[slug]/loading.tsx` | `CategoryPageSkeleton` |
| `/colecoes/[slug]` | `src/app/colecoes/[slug]/loading.tsx` | `CollectionPageSkeleton` |
| `/artigos` | `src/app/artigos/loading.tsx` | `ArticleListingSkeleton` |
| `/artigos/[slug]` | `src/app/artigos/[slug]/loading.tsx` | `ArticleDetailSkeleton` |

`/artigos/categoria/[slug]` é redirect server-side — sem `loading.tsx`.  
`/contato` e `/legal` são sync — sem skeleton necessário.

### Filtros de artigos (mesma rota)

Em `/artigos`, filtros e paginação usam `router.replace` na mesma rota. `ArticleListingPendingProvider` + `ArticleListingGrid` exibem `ArticleCardSkeleton` na grid durante `useTransition`.

## Arquivos-chave

| Área | Path |
|------|------|
| Layout + Suspense header | `apps/web/src/app/layout.tsx` |
| Header skeleton | `apps/web/src/components/loading/HeaderSkeleton.tsx` |
| Barra de progresso | `apps/web/src/components/navigation/NavigationPendingBar.tsx` |
| Fetches deduplicados | `apps/web/src/lib/api/cached-fetchers.ts` |
| Pending artigos | `apps/web/src/components/articles/ArticleListingPendingContext.tsx` |
| Primitivo UI | `apps/web/src/components/ui/skeleton.tsx` |
| Skeletons de página | `apps/web/src/components/loading/*.tsx` |
| Route loading | `apps/web/src/app/**/loading.tsx` |

## Cache da home

`fetchPageLayout` usa `next: { revalidate: 60 }`. A home exporta `revalidate = 60`. Invalidação on-demand via `POST /api/revalidate` com `REVALIDATE_SECRET`.

## Dev vs produção

- **Dev:** compilação sob demanda + ícone "N" do Next.js → skeleton pode ficar visível por mais tempo; isso é normal.
- **Produção:** `revalidate` em rotas públicas → muitas transições são rápidas; skeleton pode aparecer só por instantes.

## Como testar

1. Subir API e web: ver [dev-setup.md](./dev-setup.md).
2. Navegar: home → produto → categoria → coleção → artigos → artigo → sobre.
3. Confirmar skeleton imediato na área de conteúdo; barra fina no topo no clique; header/footer estáveis.
4. Em `/artigos`, filtrar categoria → grid em skeleton (não só toolbar opaca).
5. Footer → `/sobre` → skeleton institucional imediato.

```bash
npm run lint --workspace=apps/web
```

## Próximos passos (não implementados)

- Streaming interno com Suspense granular (grid de categoria, corpo de artigo).
- Segment `error.tsx` por rota de catálogo/editorial.
