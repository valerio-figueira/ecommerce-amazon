# Admin CMS — editor de blocos (fase 2)

Editor operacional de blocos CMS no painel admin: mutação de props via drawer lateral (Sheet), adição posicional e remoção com reindexação automática.

Plano de referência: [`.cursor/plans/cms_admin_block_editor_0d0aeef3.plan.md`](../.cursor/plans/cms_admin_block_editor_0d0aeef3.plan.md)

## O quê foi entregue

- Rotas REST autenticadas `GET/POST/PATCH/DELETE /admin/pages/*`
- Use cases `GetAdminPageLayout`, `ListAdminPages` + insert com shift de `sortOrder`
- Proxy Next.js em `apps/admin/src/app/api/admin/pages/*`
- UI `CMSBlockOrderManager` em `/paginas/[slug]`
- Modais shadcn/Radix: escolher tipo, confirmar exclusão
- **Sheet lateral** (`BlockPropsSheet`) para configurar props de todos os tipos editáveis
- Formulário UX **Grade Dinâmica** (`DynamicGridForm`): 3 seções leigo-friendly (texto, filtros, layout)
- Formulários v1: `DYNAMIC_PRODUCT_GRID`, `SPACER`, `BANNER`, `RICH_TEXT`
- Listagem de páginas em `/paginas`

## Fora de escopo

- Draft / preview / publish (`POST /admin/pages/:slug/publish`)
- Drag-and-drop (`@dnd-kit`)
- Formulários completos dos 7 tipos restantes (cartão + props read-only)

## Fluxo operador

```mermaid
sequenceDiagram
  participant Admin as apps_admin
  participant Proxy as Next_api_admin
  participant API as Fastify
  participant DB as PostgreSQL

  Admin->>Proxy: PATCH /api/admin/pages/home/blocks/:id
  Proxy->>API: Bearer JWT
  API->>DB: SavePageBlock upsert props
  API-->>Admin: PageBlockDto

  Admin->>Proxy: POST blocks position=2
  API->>DB: insertBlockAtPosition shift sortOrder

  Admin->>Proxy: DELETE blocks/:id
  API->>DB: deleteBlock + reindex 0..n-1

  Admin->>Proxy: PATCH blocks/reorder
  API->>DB: updateBlocksOrder transaction
```

## Rotas API (Fastify)

Todas exigem `Authorization: Bearer <JWT>` (exceto login).

| Método | Rota | Ação |
|--------|------|------|
| `GET` | `/admin/pages` | Lista páginas (`id`, `slug`, `title`, `status`) |
| `GET` | `/admin/pages/:slug` | Layout + blocos (props crus) |
| `POST` | `/admin/pages/:slug/blocks` | Criar bloco na posição N (shift automático) |
| `PATCH` | `/admin/pages/:slug/blocks/:id` | Atualizar props/tipo/visibility |
| `DELETE` | `/admin/pages/:slug/blocks/:id` | Remover + reindexar |
| `PATCH` | `/admin/pages/:slug/blocks/reorder` | `{ blocksOrder: [{ blockId, position }] }` |

Contrato detalhado: [api-rest.md](./api-rest.md).

## UI admin

| Rota | Componente |
|------|------------|
| `/paginas` | Lista páginas com link "Editar blocos" |
| `/paginas/[slug]` | `CMSBlockOrderManager` |

### Ações no editor

- **Configurar** — drawer lateral (`BlockPropsSheet`) por `BlockType`; validação Zod em `@ecommerce-amazon/shared/cms`
- **+ Adicionar bloco** — escolha de tipo + posição (topo, entre blocos, final)
- **Excluir** — `AlertDialog`; backend reindexa índices
- **↑ ↓ / input numérico** — reorder local; botão **Salvar ordem** persiste via PATCH reorder

### Formulário Grade Dinâmica (UX leigo)

Drawer com três seções em [`DynamicGridForm.tsx`](../apps/admin/src/components/cms/props-forms/DynamicGridForm.tsx):

| Seção | Campos | UI |
|-------|--------|-----|
| Texto da vitrine | `title`, `subtitle` | Inputs + textos de apoio |
| Regras de seleção | `categoryVertical`, `minDiscountPercentage`, `sortBy` | Select (GET `/categories`), Slider 0–70% (step 5), Select com copy humanizada |
| Layout e limites | `limit` | Chips 4 / 8 / 12 / 16 |

Categorias carregadas de `GET /categories` (`{ items: [...] }`). Labels amigáveis com emoji via `dynamic-grid-form-meta.ts` (admin-only).

## Arquivos-chave

| Área | Path |
|------|------|
| Use cases | `packages/application/src/use-cases/admin-cms/` |
| Repositório (shift insert) | `packages/infrastructure/src/persistence/repositories/drizzle-page.repository.ts` |
| Rotas HTTP | `apps/api/src/adapters/http/routes/admin-cms-routes.ts` |
| Proxy admin | `apps/admin/src/app/api/admin/pages/` |
| Editor UI | `apps/admin/src/components/cms/CMSBlockOrderManager.tsx` |
| Props sheet | `apps/admin/src/components/cms/BlockPropsSheet.tsx` |
| Grade dinâmica UX | `apps/admin/src/components/cms/props-forms/DynamicGridForm.tsx` |
| Forms simples | `apps/admin/src/components/cms/forms/BlockPropsForm.tsx` |
| Schemas Zod | `packages/shared/src/cms/block-schemas.ts` |

## Como testar

```bash
npm run db:migrate && npm run db:seed
npm run dev:api    # :3000
npm run dev:admin  # :3002
```

1. Login em http://localhost:3002/login (credenciais do seed — ver [admin-app-phase1.md](./admin-app-phase1.md))
2. Abrir **Páginas** → **Editar blocos** na home
3. Adicionar bloco `dynamic_product_grid` no meio da lista
4. No drawer lateral: preencher título, categoria (dropdown populado), slider de desconto e preset de quantidade; **Aplicar configurações no bloco**
5. Reordenar com setas → **Salvar ordem**
6. Excluir bloco e verificar sequência contígua após refresh

Após salvar no admin, a home reflete na próxima visita (sem cache ISR de 60s). A API invalida Redis via `PageCacheInvalidator.invalidateBySlug`.

Testes unitários:

```bash
npm test -- --run admin-cms
```

## Próximos passos

1. Formulários dos tipos complexos (`HERO_CAROUSEL`, `HERO_SPLIT`, etc.)
2. Workflow draft/publish
3. Preview com token
