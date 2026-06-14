# Renderização pública de artigos

## O quê

Página `/artigos/[slug]` na vitrine com tipografia `@tailwindcss/typography`, auto-linking dinâmico (`auto_links`) e substituição de shortcodes `[[product:slug]]` por `ProductCard` editorial (layout horizontal inline).

## Por quê

Monetização editorial com embeds de afiliado em runtime a partir do catálogo local (sem API marketplace no request).

## Pipeline de renderização

Ordem obrigatória no Server Component:

```
GET /articles/:slug  → body cru + metadados
GET /seo/auto-links  → keywords dinâmicas
GET /products/:slug  → productDetailSchema (pros/cons) por shortcode
        ↓
injectInternalLinks(body, autoLinks)
        ↓
parseArticleShortcodes(linkedHtml)
        ↓
<article class="prose prose-neutral max-w-none">
  segmento html     → div (HTML cru, estilizado pelo prose pai)
  segmento product  → aside.not-prose → ProductCard variant="editorial"
```

## Embed editorial

- **Layout:** horizontal (`flex-row` no desktop), imagem `max-w-[160px]`, mobile empilha.
- **Prós/contras:** até 2 prós + 1 contra via `ProductEditorialProsCons`.
- **Tipografia:** ilha `not-prose` dentro do `prose` contínuo — texto do artigo flui sem blocos fragmentados.
- **CTA:** `clickOrigin="embed"`; cenários A/B conforme regras de conversão (preço stale sem urgência).

## Arquivos-chave

| Path | Função |
|------|--------|
| `apps/web/src/app/artigos/[slug]/page.tsx` | RSC, metadata, JSON-LD, fetch `productDetailSchema` |
| `apps/web/src/components/articles/ArticleBody.tsx` | `prose` único + `aside.not-prose` por embed |
| `apps/web/src/components/articles/ArticleProductEmbed.tsx` | Card editorial + disclaimer afiliado |
| `apps/web/src/components/product/ProductCard.tsx` | Variant `editorial` |
| `apps/web/src/components/product/ProductEditorialProsCons.tsx` | Listas compactas de prós/contras |
| `packages/shared/src/content/article-shortcodes.ts` | Parser `[[product:slug]]` |
| `packages/shared/src/seo/link-parser.ts` | `injectInternalLinks` com `maxMatches` |

## API pública

| Rota | Cache | Resposta |
|------|-------|----------|
| `GET /articles/:slug` | 15 min Redis | `ArticlePublicDetail` (body sem links injetados) |
| `GET /seo/auto-links` | 1 h Redis | `{ items: [{ keyword, targetUrl, maxMatches }] }` |
| `GET /products/:slug` | — | `ProductDetailDto` (inclui `pros`, `cons`) |

Auto-linking ocorre **somente na vitrine** (não na API), com classes `text-emerald-600 underline font-medium hover:text-emerald-700`.

## Como testar

```bash
npm run dev -w @ecommerce-amazon/api
npm run dev -w @ecommerce-amazon/web
```

Abrir `http://localhost:3001/artigos/guia-cadeira-ergonomica` (seed).

Verificar:
- Texto flui em um único bloco `prose` (sem múltiplos wrappers)
- Card editorial horizontal com imagem ≤160px
- Prós/contras do produto seed (2+1)
- Keywords do seed linkadas (ex.: "cadeira ergonômica")

## Próximos passos

- Admin para gerenciar `auto_links` (entregue — ver [auto-links-admin.md](./auto-links-admin.md))

## Índice público `/artigos`

Listagem em `apps/web/src/app/artigos/page.tsx` com busca (`?q=`), filtro por categoria (`?categoria=`) e paginação. Consome `GET /articles` e `GET /article-categories`. Links de categoria em artigos redirecionam para o índice filtrado; `/artigos/categoria/[slug]` redireciona para `/artigos?categoria={slug}`.

Ver também [articles-taxonomy-phase2.md](./articles-taxonomy-phase2.md) — categorias, author box e artigos relacionados.
