# Admin — gestão de comparações (fase 1)

CRUD editorial de comparações persistidas: revisão de intro UGC, publicação com slug legível, SEO e carrossel automático por categoria na vitrine.

| Referência            | Documento                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Comparador web fase 1 | [comparator-web-phase1.md](./comparator-web-phase1.md)                                                                  |
| PRD Core §3.4         | [`.cursor/plans/prd_plataforma_afiliação_de44933f.plan.md`](../.cursor/plans/prd_plataforma_afiliação_de44933f.plan.md) |

## Escopo entregue

- Migration `0023_comparison_editorial` — `status`, `source`, `slug`, SEO, `show_category_carousel`, timestamps
- Admin `/comparacoes` — listagem, criar curada, editar UGC, publicar, excluir
- API admin `GET/POST/PATCH/DELETE /admin/comparisons` + `POST .../publish`
- `GET /comparisons/:identifier` — resolve UUID (`shareToken`) ou slug (regex no use case)
- Vitrine `/comparar/[param]` — canonical slug, `noindex` em draft, 301 token→slug, carrossel ≥3 itens
- Sitemap — apenas `published` + `slug`
- Subatribuição afiliado — `comparisonSlug` nos links `/go` quando publicado

## Fora de escopo

- Carrossel com produtos escolhidos manualmente pelo operador
- TipTap na intro (textarea)
- Badge queda 30d

## Fluxo editorial

```
UGC POST /comparisons → draft (noindex, /comparar/{token})
       ↓
Admin revisa intro (≥150 palavras) + slug
       ↓
POST /admin/comparisons/:id/publish → published (/comparar/{slug}, sitemap, index)
```

Comparações curadas: operador cria em **Nova comparação** → mesmo fluxo de publicação.

## Regras de negócio

| Regra        | Detalhe                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| Publicação   | Slug obrigatório, único, intro ≥150 **palavras**                                 |
| Indexação    | `draft` → `noindex`; `published` → indexável                                     |
| URL canônica | `/comparar/{slug}`; token legado redireciona 301                                 |
| Carrossel    | Mesma categoria; fallback categoria pai; omitir se <3 itens                      |
| Afiliado     | `comparisonSlug` em `ascsubtag` (Amazon), `sub_id` (Shopee), `utm_campaign` (ML) |

## API admin

| Método | Rota                             |
| ------ | -------------------------------- |
| GET    | `/admin/comparisons`             |
| GET    | `/admin/comparisons/:id`         |
| POST   | `/admin/comparisons`             |
| PATCH  | `/admin/comparisons/:id`         |
| POST   | `/admin/comparisons/:id/publish` |
| DELETE | `/admin/comparisons/:id`         |

Schemas: `packages/shared/src/admin/comparison-schemas.ts`

## Arquivos-chave

| Camada     | Path                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| Use cases  | `packages/application/src/use-cases/admin-comparison/`                       |
| Público    | `packages/application/src/use-cases/comparison/GetComparisonByIdentifier.ts` |
| Repository | `DrizzleProductComparisonRepository` em `drizzle-content.repository.ts`      |
| Admin UI   | `apps/admin/src/app/(dashboard)/comparacoes/`                                |
| Vitrine    | `apps/web/src/app/comparar/[param]/page.tsx`                                 |

## Como testar

```bash
# Migration
npm run db:migrate -w @ecommerce-amazon/infrastructure

# Unit tests
npx vitest run packages/application/src/use-cases/comparison packages/application/src/use-cases/admin-comparison

# Admin (com API + admin rodando)
# 1. Abra /comparacoes
# 2. Edite comparação UGC ou crie curada
# 3. Publique com slug e intro ≥150 palavras
# 4. Confira /comparar/{slug} na vitrine e entrada no sitemap
```

## Próximos passos

- Carrossel curado manual (produtos extras escolhidos no admin)
- Dashboard: cliques por `comparisonSlug` nos relatórios internos
