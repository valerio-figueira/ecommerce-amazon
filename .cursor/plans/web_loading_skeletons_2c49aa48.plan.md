---
name: Web loading skeletons
overview: Adicionar feedback visual de carregamento na vitrine (`apps/web`) via `loading.tsx` do App Router e skeletons que espelham o layout de cada tipo de página, eliminando a sensação de "freeze" durante navegação entre rotas.
todos:
  - id: skeleton-primitive
    content: Criar `components/ui/skeleton.tsx` (primitivo base com animate-pulse)
    status: completed
  - id: page-skeletons
    content: Criar componentes em `components/loading/` (ProductDetail, Category, Collection, ArticleListing, ArticleDetail, Home + ProductCardSkeleton)
    status: completed
  - id: loading-files
    content: Adicionar `loading.tsx` em app root + 5 segmentos de rota dinâmica/listagem
    status: completed
  - id: wire-bento-skeleton
    content: Reutilizar `BentoHubMixSkeleton` no `HomePageSkeleton`
    status: completed
  - id: docs
    content: Documentar em `docs/web-loading-skeletons.md` e atualizar `docs/README.md`
    status: completed
isProject: false
---

# Skeletons de loading na vitrine web

## Diagnóstico

O lag ao clicar em links na vitrine é **esperado no App Router** quando não há `loading.tsx`: o header/footer permanecem, mas a área `{children}` **mantém a página anterior** até o Server Component da nova rota terminar o fetch — sem feedback visual.

| Fator | Impacto |
|-------|---------|
| **Dev** | Compilação sob demanda + sem cache ISR → latência maior que produção |
| **Produção** | `revalidate = 300` em quase todas as rotas → páginas frequentemente servidas do cache, mas cold start / primeira visita ainda pode demorar |
| **Estado atual** | Zero `loading.tsx`; skeletons só em blocos CMS client-side (`ProductCarousel`, `FeaturedProductBlock`); `BentoHubMixSkeleton` existe mas **não é usado** |

```mermaid
sequenceDiagram
  participant User
  participant Link
  participant Shell as RootLayout_shell
  participant RSC as ServerPage_fetch

  User->>Link: click
  Link->>Shell: navegação client
  Note over Shell: header/footer ok
  Note over Shell: children = página ANTIGA (sem loading.tsx)
  RSC->>RSC: fetch API + render
  RSC->>Shell: swap children
  Note over Shell: nova página visível
```

Com `loading.tsx`, o swap imediato mostra skeleton na área de conteúdo enquanto o RSC trabalha.

## Abordagem

Usar o mecanismo nativo do Next.js 15: **`loading.tsx` por segmento de rota** + componentes skeleton reutilizáveis que **replicam a estrutura visual** de cada página (max-width, grids, hero, etc.), alinhados ao padrão visual existente (`animate-pulse`, `bg-neutral-200`, `rounded-[var(--radius)]`).

Não usar barra global no topo (preferência do usuário: skeleton).

## 1. Primitivo base

Criar [`apps/web/src/components/ui/skeleton.tsx`](apps/web/src/components/ui/skeleton.tsx):

- `div` com `animate-pulse rounded-md bg-neutral-200`
- prop `className` via `cn()` (mesmo util de [`apps/web/src/lib/utils.ts`](apps/web/src/lib/utils.ts))
- padrão shadcn mínimo — evita repetir classes inline em 10+ lugares

## 2. Skeletons compostos por layout de página

Nova pasta [`apps/web/src/components/loading/`](apps/web/src/components/loading/) com componentes **sem fetch** (só markup):

| Componente | Espelha | Estrutura |
|------------|---------|-----------|
| `ProductCardSkeleton` | [`ProductCard`](apps/web/src/components/product/ProductCard.tsx) | `aspect-[4/5] rounded-2xl` + linhas de texto |
| `ProductGridSkeleton` | grid de categorias/coleções | `grid-cols-2 md:3 lg:4` com N cards |
| `ProductDetailSkeleton` | [`produtos/[slug]/page.tsx`](apps/web/src/app/produtos/[slug]/page.tsx) | `max-w-5xl`, breadcrumb, `md:grid-cols-2` (imagem + info), blocos de análise |
| `CategoryPageSkeleton` | [`categorias/[slug]/page.tsx`](apps/web/src/app/categorias/[slug]/page.tsx) | sidebar `240px` (lg) + header + grid |
| `CollectionPageSkeleton` | [`colecoes/[slug]/page.tsx`](apps/web/src/app/colecoes/[slug]/page.tsx) | `max-w-7xl`, badge + título + grid |
| `ArticleCardSkeleton` | [`ArticleCard`](apps/web/src/components/articles/ArticleCard.tsx) | imagem + título + excerpt |
| `ArticleListingSkeleton` | [`artigos/page.tsx`](apps/web/src/app/artigos/page.tsx) | header + toolbar chips + grid 3 col |
| `ArticleDetailSkeleton` | [`ArticleHero`](apps/web/src/components/articles/ArticleBody.tsx) + body | cover `aspect-[21/9]`, título, parágrafos |
| `HomePageSkeleton` | [`page.tsx`](apps/web/src/app/page.tsx) | reutilizar [`BentoHubMixSkeleton`](apps/web/src/components/blocks/BentoHubMixSkeleton.tsx) (hero + offer + list) em `space-y-10` |

Todos os skeletons devem incluir:
- `aria-busy="true"` no `<main>`
- texto oculto `role="status"` com "Carregando…" para acessibilidade

## 3. Arquivos `loading.tsx` por rota

| Arquivo | Skeleton |
|---------|----------|
| [`apps/web/src/app/loading.tsx`](apps/web/src/app/loading.tsx) | `HomePageSkeleton` — fallback genérico (home e qualquer rota sem skeleton específico) |
| [`apps/web/src/app/produtos/[slug]/loading.tsx`](apps/web/src/app/produtos/[slug]/loading.tsx) | `ProductDetailSkeleton` |
| [`apps/web/src/app/categorias/[slug]/loading.tsx`](apps/web/src/app/categorias/[slug]/loading.tsx) | `CategoryPageSkeleton` |
| [`apps/web/src/app/colecoes/[slug]/loading.tsx`](apps/web/src/app/colecoes/[slug]/loading.tsx) | `CollectionPageSkeleton` |
| [`apps/web/src/app/artigos/loading.tsx`](apps/web/src/app/artigos/loading.tsx) | `ArticleListingSkeleton` |
| [`apps/web/src/app/artigos/[slug]/loading.tsx`](apps/web/src/app/artigos/[slug]/loading.tsx) | `ArticleDetailSkeleton` |

**Não criar** loading para `artigos/categoria/[slug]` — é redirect instantâneo a [`artigos/categoria/[slug]/page.tsx`](apps/web/src/app/artigos/categoria/[slug]/page.tsx).

## 4. Melhoria complementar (artigos — filtros/paginação)

A listagem de artigos já usa `useTransition` com `opacity-70` no toolbar/pagination. Opcional nesta entrega: durante `isPending`, trocar opacity por **`ArticleListingSkeleton` só na grid** (mantendo toolbar interativo). Baixa prioridade — o `loading.tsx` de `/artigos` cobre navegação vinda de outras páginas; filtros são client-side na mesma rota.

## 5. O que NÃO muda

- Blocos CMS na home (`ProductGridBlock`, `FeaturedProductBlock`) — já têm loading client-side via React Query
- Root layout — header/footer continuam estáveis (sem skeleton no shell)
- Sem `template.tsx`, NProgress ou `useLinkStatus` — skeleton na área de conteúdo é suficiente para o pedido

## 6. Dev vs produção

Documentar na entrega: skeleton **não elimina** latência real (fetch + compile em dev); melhora **perceived performance**. Em produção com ISR, muitas transições serão rápidas e o skeleton pode aparecer só por instantes — comportamento aceitável.

## 7. Documentação

Criar [`docs/web-loading-skeletons.md`](docs/web-loading-skeletons.md) e indexar em [`docs/README.md`](docs/README.md):
- mecanismo (`loading.tsx` + skeletons)
- mapa rota → skeleton
- como testar em dev

## Verificação manual

1. `npm run dev` (web + api)
2. Navegar: home → produto → categoria → coleção → artigos → artigo
3. Confirmar skeleton imediato em cada transição (header/footer estáveis)
4. Filtros em `/artigos` — verificar que não quebra (mesma rota, sem novo loading.tsx)
5. `npm run lint` e `npm run typecheck` no pacote `apps/web`
