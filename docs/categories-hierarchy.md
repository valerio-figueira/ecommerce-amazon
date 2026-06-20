# Categorias hierárquicas (SEO + taxonomia)

Árvore de categorias com auto-relacionamento, metadados editoriais para páginas-ímã de tráfego e preparação para mapeamento de browse nodes (Amazon, Mercado Livre, Shopee).

## O quê foi entregue

- Tabela `categories` com hierarquia (`parent_id`), ordenação, SEO e IDs de marketplace
- `products.category_id` (FK) substituindo `category_vertical`
- Migration `0008_categories_hierarchy.sql` com backfill das 3 verticais legadas
- API pública: `GET /categories` (árvore), `GET /categories/:slug` (detalhe SEO)
- API admin: CRUD + reorder em `/admin/categories`
- Admin: tela `/categorias` com árvore visual e formulário SEO
- Produto: seletor cascata (`CategoryCascadeSelect`) amarrado à folha
- Vitrine: `/categorias/[slug]` SSR com metadata, JSON-LD, sidebar em árvore e grid de produtos
- Home CMS: pills em cascata (2ª fileira de subcategorias) filtrando a grade vinculada
- Header: hub único **Categorias** (flyout 2 colunas no desktop + drawer accordion no mobile) — barra fixa, escala com N raízes
- Breadcrumb de produto com links para `/categorias/{slug}`

## Por quê

Modelo plano (`category_vertical` string) não suportava subcategorias, páginas SEO de categoria nem de/para com browse nodes das APIs de afiliado.

## Como funciona

```mermaid
flowchart LR
  Admin["Admin /categorias"] --> API["API /admin/categories"]
  API --> DB["categories + products.category_id"]
  DB --> PubAPI["GET /categories"]
  PubAPI --> Web["/categorias/slug + SiteHeader"]
  ProdForm["Produto categoryId"] --> DB
```

- Produto vincula-se à **folha** da árvore (validação no create/update)
- **Navegação** (`/categorias/{slug}`, header, pills, sidebar) funciona em **qualquer nó** — raiz, intermediário ou folha — e lista produtos da subárvore
- `GET /products?category=slug` filtra a **subárvore** (produtos em descendentes)
- Slug globalmente único → URL `/categorias/{slug}`

## Arquivos-chave

| Camada       | Path                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| Schema       | `packages/infrastructure/src/persistence/drizzle/schema/categories.ts`                     |
| Migration    | `packages/infrastructure/src/persistence/drizzle/migrations/0008_categories_hierarchy.sql` |
| Domain       | `packages/domain/src/entities/Category.ts`                                                 |
| Repository   | `packages/infrastructure/src/persistence/repositories/drizzle-category.repository.ts`      |
| Use cases    | `packages/application/src/use-cases/category/`, `admin-category/`                          |
| API          | `apps/api/src/adapters/http/routes/index.ts`, `admin-category-routes.ts`                   |
| Admin UI     | `apps/admin/src/app/(dashboard)/categorias/page.tsx`                                       |
| Web pills    | `apps/web/src/components/blocks/CategoryPillsRow.tsx`                                      |
| Web sidebar  | `apps/web/src/components/category/CategorySidebarTree.tsx`                                 |
| Web header   | `CategoryCatalogFlyout.tsx`, `CategoryCatalogDrawer.tsx`, `SiteHeader.tsx`                 |
| Tree helpers | `packages/shared/src/category/category-tree-nav.ts`, `resolve-cascade-category-id.ts`      |

## API (resumo)

### `GET /categories`

```typescript
{
  items: Array<{ slug; label; icon?; productCount; subcategories? }>;
}
```

### `GET /categories/:slug`

Detalhe com `seoTitle`, `seoDescription`, `descriptionHtml`, `breadcrumbs`, `children`.

### Admin

- `GET /admin/categories` — árvore completa
- `POST /admin/categories` — criar
- `PATCH /admin/categories/:id` — editar
- `DELETE /admin/categories/:id` — excluir (sem filhos/produtos)
- `PATCH /admin/categories/reorder` — ordenação

## Como rodar / testar

```bash
# Aplicar migration
npm run db:migrate -w @ecommerce-amazon/infrastructure

# Seed (inclui árvore exemplo games → perifericos → teclados-mecanicos)
npm run db:seed -w @ecommerce-amazon/infrastructure

# Testes
npm run test -w @ecommerce-amazon/shared
npm run test -w @ecommerce-amazon/application
```

1. Admin → **Categorias** → criar subcategoria e preencher `descriptionHtml`
2. Admin → **Produtos** → selecionar categoria em cascata
3. Home → selecionar pill **Games** → segunda fileira com subcategorias; grade filtra por slug
4. Vitrine → `/categorias/home-office` → sidebar em árvore (desktop) + chips horizontais (mobile)
5. Header → botão **Categorias** abre flyout (desktop) ou drawer (mobile); barra não cresce com novas raízes
6. `GET /products?category=games` deve incluir produtos em subcategorias

## Formulário admin (refino UX)

- **Seletor cascata (4 níveis)** — `CategoryCascadeSelect` com até 4 selects (alinhado a `MAX_CATEGORY_DEPTH = 4`); valor persistido = `categoryId` da folha
- **Validação client-side** — submit bloqueia seleção incompleta; produtos com categoria legada (raiz/intermediário) exibem aviso e exigem re-seleção até a folha
- **Helpers** — `resolveLeafCategoryId` / `buildCascadePath` em `packages/shared/src/category/resolve-cascade-category-id.ts`
- **Slug automático** — gerado a partir do nome (`slugifyTitle`); preview da URL `/categorias/{slug}`; campo avançado "Personalizar slug" com botão "Usar slug do nome"
- **SEO automático** — templates em `packages/shared/src/seo/category-meta.ts`; campos vazios usam fallback na vitrine (ver `generateMetadata` em `/categorias/[slug]`)
- **Placeholders e tooltips** — dicas por campo (ícone ?) com orientações SEO
- **Prompt LLM** — ícone ✨ na seção SEO; prompt em `apps/admin/src/lib/category-llm-prompt.ts` retorna JSON `{ seoTitle, seoDescription, descriptionHtml }` para colar em IA externa

## Exposição na vitrine

| Ponto            | Componente                      | Comportamento                                                                                         |
| ---------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Home pills       | `CategoryPillsRow`              | 1ª fileira = raízes CMS; 2ª fileira = filhos do pai ativo                                             |
| Página categoria | `CategorySidebarTree`           | Árvore lateral (lg+); chips horizontais em mobile                                                     |
| Header desktop   | `CategoryCatalogFlyout`         | Botão Categorias → flyout 2 colunas; raízes são links clicáveis **e** expandem subcategorias no hover |
| Header mobile    | `CategoryCatalogDrawer`         | Botão Categorias → drawer; raiz linkável + botão +/- para expandir filhos                             |
| Produto          | breadcrumb em `produtos/[slug]` | `Home > … > categoria > produto`                                                                      |

## Dados legados (produtos em raiz)

A migration `0008` backfillou produtos nas 3 raízes. Após criar subcategorias, esses `category_id` deixam de ser folha. Para corrigir manualmente em produção:

```sql
-- Exemplo: mover produtos ainda na raiz "games" para folha "teclados-mecanicos"
UPDATE products p
SET category_id = c_leaf.id
FROM categories c_root
JOIN categories c_leaf ON c_leaf.slug = 'teclados-mecanicos'
WHERE p.category_id = c_root.id
  AND c_root.slug = 'games';
```

Reaplicar seed em dev (`npm run db:seed`) já atribui produtos gamer à folha `teclados-mecanicos`.

## Próximos passos (fora desta entrega)

- Worker: auto-mapeamento `amazon_browse_node` → `category_id`
- Imagens no mega menu (hoje só `icon` textual/emoji)
- Paginação e filtros avançados na listagem de categoria
- Múltiplas categorias por produto (M:N)
