# Renderização pública de artigos

## O quê

Página `/artigos/[slug]` na vitrine com tipografia `@tailwindcss/typography`, auto-linking dinâmico (`auto_links`) e substituição de shortcodes `[[product:slug]]` e `[[compare:slug-1,slug-2]]` por componentes editoriais (card e tabela comparativa).

## Por quê

Monetização editorial com embeds de afiliado em runtime a partir do catálogo local (sem API marketplace no request).

## Pipeline de renderização

Ordem obrigatória no Server Component:

```
GET /articles/:slug  → body cru + metadados + embeddedProducts
GET /seo/auto-links  → keywords dinâmicas
        ↓
injectInternalLinks(body, autoLinks)
        ↓
parseArticleShortcodes(linkedHtml)
        ↓
<article class="prose prose-neutral max-w-none">
  segmento html     → div (HTML cru, estilizado pelo prose pai)
  segmento product  → aside.not-prose → ProductCard variant="editorial"
  segmento compare  → aside.not-prose → ComparisonTable (2–3 produtos)
```

## Embed editorial (`[[product:slug]]`)

- **Layout:** horizontal desde o mobile — imagem `w-28` (112px) à esquerda, conteúdo à direita; a partir de `sm` imagem `w-40` (160px). CTAs abaixo do título/preço/prós-contras (nunca coluna lateral estreita).
- **Título:** até 2 linhas (`line-clamp-2`).
- **CTAs:** empilhados full-width no mobile; a partir de `sm`, largura intrínseca (`w-fit`) alinhada à esquerda abaixo do conteúdo; cenário A (card → detalhe) e B (botão → marketplace).
- **Prós/contras:** até 2 prós + 1 contra via `ProductEditorialProsCons`.
- **Tipografia:** ilha `not-prose` dentro do `prose` contínuo — texto do artigo flui sem blocos fragmentados.
- **CTA:** `clickOrigin="embed"`; cenários A/B conforme regras de conversão (preço stale sem urgência).

## Tabela comparativa (`[[compare:slug-1,slug-2,slug-3]]`)

- **Validação:** 2–3 slugs kebab-case separados por vírgula.
- **Desktop:** tabela shadcn com colunas por produto — resumo, badges, specs dinâmicas (`specs_normalized` → `specs`), prós/contras, rating, CTA.
- **Mobile:** cards horizontais com scroll (`overflow-x-auto flex flex-row`).
- **Badges contextuais (linha Destaques):** apenas Melhor Geral (maior `editorialScore`) e Custo-Benefício (menor preço não-stale, só quando ≥2 produtos têm preço válido). Badges editoriais absolutas (ex.: Escolha editorial) não aparecem na tabela comparativa.
- **Specs ausentes:** traço `-` na célula.
- **Admin:** botão **Comparar** no editor de artigos gera o shortcode via modal multi-seleção.

## Arquivos-chave

| Path | Função |
|------|--------|
| `apps/web/src/app/artigos/[slug]/page.tsx` | RSC, metadata, JSON-LD, consome `embeddedProducts` |
| `apps/web/src/components/articles/ArticleBody.tsx` | `prose` único + embeds product/compare |
| `apps/web/src/components/articles/ComparisonTable.tsx` | Tabela comparativa responsiva |
| `apps/web/src/components/articles/ArticleProductEmbed.tsx` | Card editorial |
| `apps/web/src/components/ui/table.tsx` | Primitives shadcn Table |
| `packages/shared/src/content/article-shortcodes.ts` | Parser `[[product:]]` e `[[compare:]]` |
| `packages/application/src/use-cases/content/GetArticleWithEmbeds.ts` | Resolve produtos embutidos |
| `apps/admin/src/components/articles/CompareInsertModal.tsx` | Helper admin para gerar shortcode |

## API pública

| Rota | Cache | Resposta |
|------|-------|----------|
| `GET /articles/:slug` | 15 min Redis | `ArticlePublicDetail` + `embeddedProducts` (mapa slug → produto ou null) |
| `GET /seo/auto-links` | 1 h Redis | `{ items: [{ keyword, targetUrl, maxMatches }] }` |

Auto-linking ocorre **somente na vitrine** (não na API), com classes `text-emerald-600 underline font-medium hover:text-emerald-700`.

## Como testar

```bash
npm run dev -w @ecommerce-amazon/api
npm run dev -w @ecommerce-amazon/web
npm run dev -w @ecommerce-amazon/admin
```

1. Admin: inserir `[[compare:cadeira-ergonomica-home-office,headset-gamer-7-1]]` via botão **Comparar**.
2. Publicar artigo e abrir `/artigos/{slug}`.
3. Verificar tabela desktop, scroll horizontal no mobile, specs do seed e CTAs afiliados.
4. Confirmar que `[[product:]]` continua renderizando card editorial via `embeddedProducts`.

## Clusters Hub & Spoke

Quando o artigo pertence a um cluster publicado, a página inclui:

| Componente | Quando | Posição |
|------------|--------|---------|
| `ArticleSeoAnchor` | Artigo é **pilar** e há satélites publicados | Entre hero e corpo |
| `ArticleClusterCarousel` | ≥2 membros publicados no cluster | Antes de `ArticleRelatedGrid` |

Ordem dos satélites: `publishedAt ASC`. JSON-LD `@graph` inclui `ItemList` no pilar.

Doc completa: [content-clusters-hub-spoke.md](./content-clusters-hub-spoke.md).

## Próximos passos

- Página standalone `/comparar/[shareToken]` — ver [comparator-web-phase1.md](./comparator-web-phase1.md)

## Índice público `/artigos`

Listagem em `apps/web/src/app/artigos/page.tsx` com busca (`?q=`), filtro por categoria (`?categoria=`) e paginação. UI enxuta: título, busca, pills de categoria e grid — sem contadores, rótulos redundantes ou bloco de filtros ativos. Consome `GET /articles` e `GET /article-categories`. Links de categoria em artigos redirecionam para o índice filtrado; `/artigos/categoria/[slug]` redireciona para `/artigos?categoria={slug}`.

Ver também [articles-taxonomy-phase2.md](./articles-taxonomy-phase2.md) — categorias, author box e artigos relacionados.
