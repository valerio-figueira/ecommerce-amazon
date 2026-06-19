# Comparador web — fase 1

Comparador standalone na vitrine: seleção de 2–3 produtos da **mesma categoria**, barra flutuante, páginas `/comparar` e URL compartilhável via `shareToken`.

| Referência | Documento |
|------------|-----------|
| PRD Core §3.4 | [`.cursor/plans/prd_plataforma_afiliação_de44933f.plan.md`](../.cursor/plans/prd_plataforma_afiliação_de44933f.plan.md) |
| Comparativos em artigos | [articles-public-rendering.md](./articles-public-rendering.md) |
| API | [api-rest.md](./api-rest.md) — seção Comparador |

## Escopo entregue

- Toggle **Comparar** nos `ProductCard` (listagens, busca, categorias, CMS, coleções)
- `ComparisonProvider` + `CompareBar` + toast de bloqueio por categoria
- Página efêmera `/comparar?p=slug-a,slug-b` (`noindex`)
- Página persistida `/comparar/[shareToken]` com intro editorial, OG e JSON-LD
- `POST /comparisons` idempotente (dedupe A+B = B+A) + validação mesma categoria
- `GET /comparisons/:shareToken` com presenter (`ProductDetailDto[]`)
- Tracking: `origin=comparador`, `placement=comparison.page`
- CTA **Adicionar todos à lista** na tabela standalone

## Fora de escopo (fase 1)

- Comparador cross-marketplace mesmo SKU
- Badge queda 30d (campo ainda ausente no DTO público)
- Admin CRUD de comparações curadas
- Comparações geradas por usuários no **sitemap** (ver SEO abaixo)

## Fluxo

```
ProductCard (toggle) → CompareBar → /comparar?p=...
                                  → Gerar link → POST /comparisons → /comparar/{shareToken}
```

Restrições:

- Máximo **3** produtos por seleção
- Todos da **mesma `categoryId`** (ou todos sem categoria)
- Server valida categoria em `POST /comparisons` e na página `?p=`

## Rotas web

| Rota | Indexação | Descrição |
|------|-----------|-----------|
| `/comparar?p=slug1,slug2` | `noindex, follow` | Comparativo de sessão |
| `/comparar/[shareToken]` | `index, follow` | Link compartilhável |

## API

### `POST /comparisons`

Body: `{ productIds: uuid[2..3], editorialIntro: string (min 150) }`

- Ordena IDs, valida mesma categoria, deduplica conjunto existente
- **200** se comparação já existe; **201** se criada

### `GET /comparisons/:shareToken`

Response (`comparisonPublicDetailSchema`):

```typescript
{
  shareToken: string;
  editorialIntro: string;
  createdAt: string;
  products: ProductDetailDto[];
}
```

## Arquivos-chave

| Camada | Path |
|--------|------|
| Schemas | `packages/shared/src/comparison/` |
| Intro editorial | `packages/shared/src/comparison/build-editorial-intro.ts` |
| Use case | `packages/application/src/use-cases/comparison/CreateComparison.ts` |
| Presenter | `apps/api/src/adapters/presenters/comparison.presenter.ts` |
| Provider / barra | `apps/web/src/components/comparison/` |
| Tabela | `apps/web/src/components/comparison/comparison-table-core.tsx` |
| Páginas | `apps/web/src/app/comparar/` |
| JSON-LD | `packages/shared/src/seo/comparison-json-ld.ts` |

## SEO

- `?p=` nunca é canônico (`noindex`)
- `/comparar/[shareToken]` tem OG + `buildComparisonPageJsonLd`
- **Sitemap:** comparações de usuário **não** entram no sitemap neste MVP (anti-spam UGC). Fase posterior: `status: published` via admin.

## Como testar

```bash
# API (com sessão)
curl -s -X POST http://localhost:3000/comparisons \
  -H 'Content-Type: application/json' \
  -H 'x-session-id: test-session' \
  -d '{"productIds":["<uuid1>","<uuid2>"],"editorialIntro":"'$(python -c 'print("x"*150)')'"}'

curl -s http://localhost:3000/comparisons/<shareToken>
```

Vitrine:

1. Selecione 2 produtos da mesma categoria nos cards
2. Abra **Comparar agora** na barra inferior
3. Gere link compartilhável e abra `/comparar/{token}`
4. Tente adicionar produto de outra categoria → toast de bloqueio

## Próximos passos

- Admin: comparações curadas com `status: published` → sitemap
- Badge 30d na tabela quando Pipeline C expor `price_drop_pct_30d`
- Interlinking artigo → comparador técnico standalone
