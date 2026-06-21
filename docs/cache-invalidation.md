# Cache invalidation

Correções de invalidação Redis + revalidação on-demand do Next.js após mutações admin/worker.

## Problema resolvido

Edições no admin/worker não refletiam imediatamente na vitrine por:

1. **Chave Redis errada** em artigos (`vitrine:article:slug:` vs `vitrine:article:slug:v2:`)
2. **Workers** Pipeline A/C e cupons sem invalidar cache
3. **Next.js ISR** (60–600s) sem `revalidatePath` após mutações

## Camadas

| Camada  | Mecanismo                                       | Onde                                                     |
| ------- | ----------------------------------------------- | -------------------------------------------------------- |
| Redis   | `cache.del` / `INCR cache:version:product:{id}` | Use cases de leitura/escrita                             |
| Next.js | `POST /api/revalidate`                          | `apps/web` — chamado pela API via `PublicWebRevalidator` |

## Chaves Redis

| Chave                            | TTL    | Invalidação                                         |
| -------------------------------- | ------ | --------------------------------------------------- |
| `vitrine:article:slug:v2:{slug}` | 15 min | CRUD artigos, update categoria editorial            |
| `vitrine:page:slug:{slug}`       | 5 min  | CMS blocos                                          |
| `vitrine:collection:slug:{slug}` | 10 min | CRUD coleções                                       |
| `vitrine:seo:auto-links`         | 1 h    | CRUD auto-links                                     |
| `vitrine:coupons:active`         | 30 min | `VerifyCouponsBatch`                                |
| `cache:version:product:{id}`     | —      | Worker preços/sync/hygiene, admin produto, coleções |

Helper: `@ecommerce-amazon/shared/cache` — `articlePublicCacheKey`, `COUPONS_ACTIVE_CACHE_KEY`.

## Revalidação web (on-demand)

### Env

```bash
REVALIDATE_SECRET=dev-revalidate-secret-change-in-production
WEB_PUBLIC_URL=http://localhost:3001   # default: http://localhost:${WEB_PORT}
# Swarm: API usa WEB_INTERNAL_URL=http://web:3001 para POST /api/revalidate (overlay)
```

- **API**: lê `REVALIDATE_SECRET`, `WEB_INTERNAL_URL` (preferido) ou `WEB_PUBLIC_URL`
- **apps/web**: precisa do **mesmo** `REVALIDATE_SECRET` (root `.env` via `next.config.ts` ou env no Swarm)

Se `REVALIDATE_SECRET` estiver vazio, a API usa `NoOpPublicWebRevalidator` (só Redis).

### Endpoint

`POST /api/revalidate` — header `Authorization: Bearer ${REVALIDATE_SECRET}`

```json
{
  "paths": ["/produtos/meu-produto", "/artigos"],
  "layoutPaths": ["/artigos"],
  "tags": ["public:category-nav-tree"]
}
```

- `paths` → `revalidatePath(path)`
- `layoutPaths` → `revalidatePath(path, 'layout')` (ex.: auto-links em todos os artigos)
- `tags` → `revalidateTag(tag)` — invalida `unstable_cache` (header categorias, `/sobre`)

### Port

`PublicWebRevalidator` — `packages/domain/src/gateways/index.ts`  
Implementação HTTP — `packages/infrastructure/src/cache/http-public-web.revalidator.ts`

## Mutations que disparam invalidação

| Módulo                | Redis            | Web paths                                                           |
| --------------------- | ---------------- | ------------------------------------------------------------------- |
| Artigos               | slug v2          | `/artigos`, `/artigos/{slug}`                                       |
| Categorias editoriais | artigos linkados | listing + categoria + artigos                                       |
| Produtos              | version stamp    | `/produtos/{slug}`, categorias afetadas                             |
| Categorias produto    | —                | `/categorias/{slug}`, `/` + layout + tag `public:category-nav-tree` |
| Institucional (Sobre) | —                | `/sobre` + layout + tag `public:institutional:sobre`                |
| Coleções              | slug + products  | `/colecoes/{slug}`, `/`                                             |
| CMS                   | page slug        | `/` ou `/paginas/{slug}`                                            |
| Auto-links            | global key       | layout `/artigos`                                                   |
| Worker sync/hygiene   | product version  | —                                                                   |
| Worker cupons         | coupons key      | —                                                                   |

## Arquivos-chave

- `packages/shared/src/cache/public-cache-keys.ts`
- `packages/application/src/cache/public-cache.helpers.ts`
- `packages/infrastructure/src/di/api-container.ts` — wiring `webRevalidator`
- `packages/infrastructure/src/di/worker-container.ts` — cache nos pipelines A/C/D
- `apps/web/src/app/api/revalidate/route.ts`

## Como testar

```bash
# 1. Redis — editar artigo no admin e conferir que a chave v2 some
redis-cli KEYS 'vitrine:article:slug:v2:*'

# 2. Revalidate manual
curl -X POST http://localhost:3001/api/revalidate \
  -H "Authorization: Bearer dev-revalidate-secret-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"paths":["/artigos/meu-slug"]}'

# 3. Fluxo completo: PATCH admin produto → página pública atualizada sem esperar ISR
```

## Próximos passos (fora do escopo)

- Version stamp para listagem/detalhe produto no Redis (ainda lê DB direto)
