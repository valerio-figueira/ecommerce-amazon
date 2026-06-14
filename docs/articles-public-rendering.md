# Renderização pública de artigos

## O quê

Página `/artigos/[slug]` na vitrine com tipografia `@tailwindcss/typography`, auto-linking dinâmico (`auto_links`) e substituição de shortcodes `[[product:slug]]` por `ProductCard` compacto.

## Por quê

Monetização editorial com embeds de afiliado em runtime a partir do catálogo local (sem API marketplace no request).

## Pipeline de renderização

Ordem obrigatória no Server Component:

```
GET /articles/:slug  → body cru + metadados
GET /seo/auto-links  → keywords dinâmicas
GET /products/:slug  → batch por shortcodes extraídos
        ↓
injectInternalLinks(body, autoLinks)
        ↓
parseArticleShortcodes(linkedHtml)
        ↓
segmento html  → <div class="prose prose-neutral">
segmento product → <ProductCard variant="compact" clickOrigin="embed">
```

## Arquivos-chave

| Path | Função |
|------|--------|
| `apps/web/src/app/artigos/[slug]/page.tsx` | RSC, metadata, JSON-LD |
| `apps/web/src/components/articles/ArticleBody.tsx` | Pipeline auto-link + parser |
| `apps/web/src/components/articles/ArticleProductEmbed.tsx` | Card + disclaimer afiliado |
| `packages/shared/src/content/article-shortcodes.ts` | Parser `[[product:slug]]` |
| `packages/shared/src/seo/link-parser.ts` | `injectInternalLinks` com `maxMatches` |

## API pública

| Rota | Cache | Resposta |
|------|-------|----------|
| `GET /articles/:slug` | 15 min Redis | `ArticlePublicDetail` (body sem links injetados) |
| `GET /seo/auto-links` | 1 h Redis | `{ items: [{ keyword, targetUrl, maxMatches }] }` |

Auto-linking ocorre **somente na vitrine** (não na API), com classes `text-emerald-600 underline font-medium hover:text-emerald-700`.

## Como testar

```bash
npm run dev -w @ecommerce-amazon/api
npm run dev -w @ecommerce-amazon/web
```

Abrir `http://localhost:3001/artigos/guia-cadeira-ergonomica` (seed).

Verificar:
- Tipografia `prose` no texto
- Card compacto do produto embedado
- Keywords do seed linkadas (ex.: "cadeira ergonômica")

## Próximos passos

- Índice `/artigos` com `GET /articles`
- Admin para gerenciar `auto_links`
