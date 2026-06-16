# Skeletons de loading — vitrine web

## O quê

Feedback visual de carregamento durante navegação entre rotas em `apps/web`, via `loading.tsx` do App Router e componentes skeleton que espelham o layout de cada tipo de página.

**Fora de escopo:** barra global de progresso; skeleton em filtros client-side da listagem de artigos (mesma rota); blocos CMS na home (já têm loading via React Query).

## Por quê

Sem `loading.tsx`, o App Router mantém a página anterior visível até o Server Component da nova rota terminar o fetch — sensação de “freeze” ao clicar em links. Skeletons melhoram a **perceived performance** sem alterar a latência real.

Plano de referência: [`.cursor/plans/web_loading_skeletons_2c49aa48.plan.md`](../../.cursor/plans/web_loading_skeletons_2c49aa48.plan.md).

## Como funciona

```mermaid
sequenceDiagram
  participant User
  participant Link
  participant Shell as RootLayout
  participant Loading as loading.tsx
  participant Page as page.tsx

  User->>Link: click
  Link->>Shell: navegação client
  Note over Shell: header/footer estáveis
  Shell->>Loading: exibe skeleton imediato
  Page->>Page: fetch API + render RSC
  Page->>Shell: substitui skeleton pelo conteúdo
```

- O **root layout** (`header` + `footer`) não é recarregado.
- Cada segmento de rota pode ter seu próprio `loading.tsx`; o mais específico prevalece.
- Skeletons usam `aria-busy="true"` no `<main>` e texto oculto `role="status"` (“Carregando…”).

### Mapa rota → skeleton

| Rota | `loading.tsx` | Componente |
|------|---------------|------------|
| Fallback (home e rotas sem skeleton específico) | `src/app/loading.tsx` | `HomePageSkeleton` |
| `/produtos/[slug]` | `src/app/produtos/[slug]/loading.tsx` | `ProductDetailSkeleton` |
| `/categorias/[slug]` | `src/app/categorias/[slug]/loading.tsx` | `CategoryPageSkeleton` |
| `/colecoes/[slug]` | `src/app/colecoes/[slug]/loading.tsx` | `CollectionPageSkeleton` |
| `/artigos` | `src/app/artigos/loading.tsx` | `ArticleListingSkeleton` |
| `/artigos/[slug]` | `src/app/artigos/[slug]/loading.tsx` | `ArticleDetailSkeleton` |

`/artigos/categoria/[slug]` é redirect server-side — sem `loading.tsx`.

## Arquivos-chave

| Área | Path |
|------|------|
| Primitivo UI | `apps/web/src/components/ui/skeleton.tsx` |
| Skeletons de página | `apps/web/src/components/loading/*.tsx` |
| Bento home (reutilizado) | `apps/web/src/components/blocks/BentoHubMixSkeleton.tsx` |
| Route loading | `apps/web/src/app/**/loading.tsx` |

## Dev vs produção

- **Dev:** compilação sob demanda + sem cache ISR → skeleton pode ficar visível por mais tempo; isso é normal.
- **Produção:** `revalidate = 300` em rotas públicas → muitas transições são rápidas; skeleton pode aparecer só por instantes.

## Como testar

1. Subir API e web: ver [dev-setup.md](./dev-setup.md).
2. Navegar: home → produto → categoria → coleção → artigos → artigo.
3. Confirmar skeleton imediato em cada transição; header/footer permanecem estáveis.
4. Em `/artigos`, filtros e paginação continuam na mesma rota (sem novo `loading.tsx`).

```bash
npm run lint --workspace=apps/web
npm run typecheck --workspace=apps/web
```

## Próximos passos (não implementados)

- Skeleton parcial na grid de artigos durante `useTransition` (filtros/paginação client-side).
- Barra de progresso global opcional (`useLinkStatus`).
