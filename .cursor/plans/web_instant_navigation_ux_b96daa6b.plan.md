---
name: Web instant navigation UX
overview: "Corrigir a sensação de \"app travada\" na vitrine web desbloqueando o mecanismo nativo `loading.tsx` (causa raiz: header async no layout sem Suspense) e reforçar feedback visual imediato em navegação e filtros."
todos:
  - id: suspense-header
    content: Envolver SiteHeaderShell em Suspense + criar HeaderSkeleton no layout raiz
    status: completed
  - id: sobre-loading
    content: Adicionar InstitutionalPageSkeleton e apps/web/src/app/sobre/loading.tsx
    status: completed
  - id: nav-pending-bar
    content: Criar NavigationPendingBar client-side e montar no layout
    status: completed
  - id: articles-pending-grid
    content: Skeleton na grid de artigos durante useTransition (filtros/paginação)
    status: completed
  - id: cache-dedup
    content: cached-fetchers.ts com React cache() para metadata+page
    status: completed
  - id: home-revalidate
    content: fetchPageLayout revalidate 60 + export revalidate na home
    status: completed
  - id: docs-update
    content: Atualizar docs/web-loading-skeletons.md com causa raiz e novos componentes
    status: completed
isProject: false
---

# Navegação instantânea com loading na vitrine web

## Diagnóstico

Os skeletons de rota **já existem** ([`docs/web-loading-skeletons.md`](docs/web-loading-skeletons.md), 6 arquivos `loading.tsx`), mas o usuário ainda vê a página anterior congelada + ícone "N" do Next em dev.

**Causa raiz (documentação oficial Next.js):** quando o `layout.tsx` contém fetch async **sem** `<Suspense>`, a navegação **bloqueia até o layout terminar** e o `loading.tsx` do segmento filho **não aparece imediatamente**.

Hoje o layout raiz faz exatamente isso:

```38:39:apps/web/src/app/layout.tsx
            <SiteHeaderShell />
            <div className="flex-1">{children}</div>
```

[`SiteHeaderShell`](apps/web/src/components/layout/SiteHeaderShell.tsx) é async e aguarda `fetchCategoryNavTree()` (API `/categories`) antes de renderizar o header. Isso anula o fluxo desenhado no doc interno (skeleton imediato em `{children}`).

```mermaid
sequenceDiagram
  participant User
  participant Router
  participant Layout as RootLayout
  participant Header as SiteHeaderShell
  participant Loading as loading.tsx
  participant Page as page.tsx

  Note over User,Page: Comportamento atual (travado)
  User->>Router: click Link
  Router->>Layout: RSC request
  Layout->>Header: await /categories
  Note over Loading: skeleton NÃO aparece
  Header-->>Layout: header pronto
  Layout->>Page: await dados da página
  Page-->>User: troca tudo de uma vez

  Note over User,Page: Comportamento alvo
  User->>Router: click Link
  Router->>Loading: skeleton imediato em children
  par Header fetch em paralelo
  Page-->>User: conteúdo quando pronto
```

## Escopo

- **In:** `apps/web` — feedback imediato de navegação (prioridade UX)
- **Fora:** admin, otimizações profundas de API, PPR/cache components experimentais

## Fase 1 — Desbloquear `loading.tsx` (impacto máximo)

### 1.1 Suspense no header do layout raiz

Arquivo: [`apps/web/src/app/layout.tsx`](apps/web/src/app/layout.tsx)

- Importar `Suspense` do React
- Envolver `<SiteHeaderShell />` em:

```tsx
<Suspense fallback={<HeaderSkeleton />}>
  <SiteHeaderShell />
</Suspense>
```

### 1.2 Criar `HeaderSkeleton`

Novo: [`apps/web/src/components/loading/HeaderSkeleton.tsx`](apps/web/src/components/loading/HeaderSkeleton.tsx)

- Espelhar dimensões do header sticky (`sticky top-0`, `max-w-7xl`, `py-4`)
- Placeholders para logo, botão categorias, links editoriais, ícones wishlist/busca
- Reutilizar [`Skeleton`](apps/web/src/components/ui/skeleton.tsx)
- Sem `aria-busy` no header (o skeleton da página cuida do conteúdo principal)

**Resultado esperado:** em qualquer clique em `<Link>`, o `{children}` troca **imediatamente** pelo `loading.tsx` da rota destino, enquanto o header streama ou permanece do cache.

## Fase 2 — Cobertura de rotas e feedback extra

### 2.1 Skeleton para `/sobre`

Gap atual: [`apps/web/src/app/sobre/page.tsx`](apps/web/src/app/sobre/page.tsx) é async (2 fetches) mas **não tem** `loading.tsx`. Links no header e footer apontam para `/sobre`.

- Novo: [`apps/web/src/components/loading/InstitutionalPageSkeleton.tsx`](apps/web/src/components/loading/InstitutionalPageSkeleton.tsx) — hero + blocos de texto + grid de equipe
- Novo: [`apps/web/src/app/sobre/loading.tsx`](apps/web/src/app/sobre/loading.tsx)

`/contato` e `/legal` são sync (sem fetch) — não precisam de skeleton.

### 2.2 Barra de progresso global leve (opcional mas recomendado)

Mesmo com `loading.tsx` corrigido, em dev o fallback pode demorar a prefetch. Reforço client-side para feedback **no instante do clique**:

Novo: [`apps/web/src/components/navigation/NavigationPendingBar.tsx`](apps/web/src/components/navigation/NavigationPendingBar.tsx) (`'use client'`)

- `useEffect` com listener `click` (capture) em `<a href>` internos
- Ignorar: links externos, `/go/*`, `target="_blank"`, mesma URL
- `usePathname()` + `useSearchParams()` para limpar ao concluir navegação
- UI: barra fina fixa no topo (`h-0.5`, `z-50`, animação pulse) — sem nova dependência

Montar em [`layout.tsx`](apps/web/src/app/layout.tsx) dentro de `<Providers>`.

### 2.3 Filtros/paginação de artigos (mesma rota)

Em [`ArticleListingView`](apps/web/src/components/articles/ArticleListingView.tsx), toolbar e paginação já usam `useTransition` com `opacity-70`, mas a **grid não muda**.

- Extrair grid para componente client `ArticleListingGrid` que recebe `isPending` do toolbar/pagination **ou** usar um `ArticleListingPendingContext` simples
- Durante `isPending`: trocar cards por `ArticleCardSkeleton` (já existe em `components/loading/`)

Isso cobre o caso "cliquei filtro e parece travado" sem mudar de rota.

## Fase 3 — Reduzir tempo skeleton → conteúdo (secundário, diff pequeno)

Não resolve o "freeze" sozinho, mas encurta quanto tempo o skeleton fica visível:

### 3.1 Deduplicar fetches metadata + page com `cache()`

Criar [`apps/web/src/lib/api/cached-fetchers.ts`](apps/web/src/lib/api/cached-fetchers.ts) com `import { cache } from 'react'` envolvendo:

| Função cached | Usada em |
|---------------|----------|
| `getHomeLayout` | `page.tsx` (home) |
| `getProduct` | `produtos/[slug]/page.tsx` |
| `getCategory` | `categorias/[slug]/page.tsx` |
| `getCollection` | `colecoes/[slug]/page.tsx` |
| `getArticle` | `artigos/[slug]/page.tsx` |
| `fetchInstitutionalAboutPage` | `sobre/page.tsx` |

`generateMetadata` e `page.tsx` passam a importar do mesmo módulo — 1 round-trip API por navegação em vez de 2.

### 3.2 Home CMS: sair de `no-store`

Em [`apps/web/src/lib/api/client.ts`](apps/web/src/lib/api/client.ts), `fetchPageLayout` hoje usa `cache: 'no-store'`. Alterar para `next: { revalidate: 60 }` (alinhado ao default de `apiFetch`).

Em [`apps/web/src/app/page.tsx`](apps/web/src/app/page.tsx), adicionar `export const revalidate = 60`.

Invalidação continua possível via [`apps/web/src/app/api/revalidate/route.ts`](apps/web/src/app/api/revalidate/route.ts) quando CMS publicar.

## Fase 4 — Streaming interno (opcional, só se ainda houver lentidão perceptível)

Prioridade baixa; implementar apenas se Fases 1–3 não bastarem:

- **Categoria:** renderizar breadcrumbs/sidebar no shell; suspender só o grid de produtos com `<Suspense fallback={<ProductGridSkeleton />}>`
- **Artigo:** suspender corpo/auto-links após hero

## Documentação

Atualizar [`docs/web-loading-skeletons.md`](docs/web-loading-skeletons.md):

- Explicar a regra do Next.js (layout async sem Suspense bloqueia `loading.tsx`)
- Documentar `HeaderSkeleton`, `/sobre/loading.tsx`, `NavigationPendingBar`
- Remover "barra global fora de escopo" da seção de escopo (passa a implementada)
- Atualizar diagrama de sequência

## Como validar

1. `npm run dev:web` + API rodando
2. Navegar: home → produto → categoria → artigo → sobre
3. **Critério de sucesso:** no clique, área de conteúdo (`{children}`) mostra skeleton **antes** do "N" parar; header permanece interativo
4. `/sobre` via footer: skeleton institucional imediato
5. `/artigos`: filtrar categoria → grid em skeleton, não só toolbar opaca
6. `npm run lint` nos arquivos alterados

## Nota dev vs produção

O ícone "N" é **só dev** (`next dev`). Em produção o critério é skeleton/barra + transição imediata do conteúdo. Compilação on-demand em dev ainda pode alongar o tempo total, mas não deve mais manter a página anterior visível.
