# Schema de banco de dados (Drizzle / PostgreSQL)

Fonte: [`packages/infrastructure/src/persistence/drizzle/schema/index.ts`](../packages/infrastructure/src/persistence/drizzle/schema/index.ts).

Migrations: `packages/infrastructure/src/persistence/drizzle/migrations/`

```bash
npm run db:generate   # gerar migration após alterar schema
npm run db:migrate    # aplicar
npm run db:seed       # dados de desenvolvimento
```

Migrations SQL criadas manualmente precisam de entrada correspondente em `migrations/meta/_journal.json`; sem isso o Drizzle ignora o arquivo e `db:migrate` conclui sem aplicar a migration.

## Diagrama ER (simplificado)

```mermaid
erDiagram
  pages ||--o{ page_blocks : contains
  page_blocks ||--o{ click_events : tracks
  products ||--o{ price_snapshots : has
  products ||--o{ price_alerts : has
  products ||--o{ wishlist_items : has
  products ||--o{ click_events : has
  content_articles ||--o{ content_product_embeds : has
  curated_collections ||--o{ collection_products : has
  product_comparisons ||--o{ comparison_products : has
  products ||--o{ content_product_embeds : embedded_in
  products ||--o{ collection_products : in_collection
  products ||--o{ comparison_products : in_comparison
```

## Enums PostgreSQL

| Enum DB | Valores TypeScript (`packages/domain`) |
|---------|----------------------------------------|
| `marketplace` | `amazon_br`, `shopee_br`, `mercadolivre_br` |
| `availability` | `in_stock`, `out_of_stock`, `unknown` |
| `alert_status` | `pending`, `active`, `triggered`, `expired` |
| `article_type` | `guide`, `review`, `comparison`, `lookbook_social` |
| `article_status` | `draft`, `published` |
| `coupon_status` | `active`, `expired`, `unverified` |
| `discount_type` | `percent`, `fixed` |
| `snapshot_source` | `worker_cron`, `manual_override` |
| `sync_job_type` | `full_sync`, `price_refresh`, `hygiene`, `link_validation`, `coupon_verify` |
| `sync_job_status` | `running`, `completed`, `failed` |
| `page_status` | `draft`, `published` |
| `block_visibility` | `all`, `desktop`, `mobile` |
| `block_type` | ver tabela CMS abaixo |

## Tabelas

### CMS — `pages` / `page_blocks`

Migration: `0001_cms_pages.sql`.

| Tabela | Colunas principais | Índices |
|--------|-------------------|---------|
| `pages` | `id`, `slug`, `title`, `status`, `seo_title`, `seo_description`, `page_kind` enum (`block_layout`, `institutional`), `institutional_content` jsonb, `published_at`, `updated_at` | UNIQUE `(slug, status)` |
| `page_blocks` | `id`, `page_id` FK, `type`, `sort_order`, `props` JSONB, `visibility` | INDEX `(page_id, sort_order)` |

Regra de negócio: apenas um layout `published` por `slug` (índice composto).

`block_type` valores: `hero_carousel`, `featured_product`, `product_grid`, `category_pills`, `hero_split`, `curated_collection`, `coupon_strip`, `rich_text`, `banner`, `spacer`, `dynamic_product_grid`.

### Catálogo — `products`

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `marketplace` | enum | `amazon_br` \| `shopee_br` \| `mercadolivre_br` |
| `external_id` | text | ID no marketplace |
| `slug` | text | URL-friendly, UNIQUE |
| `title_clean` | text | Título higienizado (Pipeline C) |
| `title_raw` | text | Título original da fonte |
| `short_description` | text | |
| `long_description_html` | text | |
| `price_amount` | decimal(12,2) | |
| `price_strikethrough` | decimal(12,2) | opcional |
| `currency` | text | default `BRL` |
| `stale_price` | boolean | `true` se >24h sem refresh |
| `price_updated_at` | timestamptz | SLA 24h |
| `affiliate_deep_link` | text | HTTPS com tag afiliado |
| `images` | jsonb `string[]` | |
| `specs_normalized` | jsonb `Record<string,string>` | |
| `editorial_score` | int | curadoria / sort |
| `availability` | enum | |
| `rating` | decimal(3,2) | |
| `review_count` | int | |
| `category_id` | uuid FK → categories | nullable |
| `tags` | jsonb `string[]` | |
| `meta_title`, `meta_description` | text | SEO |
| `canonical_url` | varchar(512) | nullable; Editorial Override — NULL = automação no frontend |
| `pros`, `cons` | jsonb `string[]` | editorial |
| `visible` | boolean | default `true`; oculta da home quando `false`; admin lista todos |
| `created_at` | timestamptz | |

Índices: UNIQUE `slug`; UNIQUE `(marketplace, external_id)`; INDEX `(stale_price, price_updated_at)`; INDEX `(visible)`; INDEX `(category_id)`.

### Categorias — `categories`

Árvore hierárquica com SEO e mapeamento de marketplaces. Ver [categories-hierarchy.md](./categories-hierarchy.md).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `slug` | text UNIQUE | kebab-case global |
| `label` | text | |
| `icon` | varchar(50) | emoji ou Lucide |
| `parent_id` | uuid FK → categories | nullable = raiz |
| `sort_order` | int | ordenação no menu |
| `seo_title`, `seo_description` | varchar/text | |
| `description_html` | text | conteúdo editorial na listagem |
| `amazon_browse_node` | varchar(50) | worker futuro |
| `mercadolivre_category_id` | varchar(50) | |
| `shopee_category_id` | varchar(50) | |
| `visible` | boolean | default `true` |
| `created_at`, `updated_at` | timestamptz | |

### Preços — `price_snapshots`

Histórico diário para gráficos e SEO (faixa 30d).

| Coluna | Tipo |
|--------|------|
| `product_id` | uuid FK → products |
| `amount` | decimal(12,2) |
| `currency` | text |
| `source` | enum `worker_cron` \| `manual_override` |
| `captured_at` | timestamptz |

INDEX `(product_id, captured_at)`.

### Alertas — `price_alerts`

| Coluna | Tipo |
|--------|------|
| `product_id` | uuid FK |
| `email` | text |
| `target_price` | decimal |
| `status` | enum `pending` → `active` → `triggered` \| `expired` |
| `confirm_token` | text | double opt-in |
| `created_at`, `triggered_at` | timestamptz |

### Wishlist — `wishlist_items`

Sessão anônima via `session_id` (cookie web).

| Coluna | Tipo |
|--------|------|
| `session_id` | text |
| `product_id` | uuid FK |
| `marketplace` | enum |
| `sort_order` | int |
| `added_at` | timestamptz |

### Conteúdo — `content_articles` / `content_product_embeds`

| Tabela | Colunas |
|--------|---------|
| `content_articles` | `slug` UNIQUE, `title`, `excerpt`, `cover_image_url`, `body`, `type`, `status`, `author_id` FK → `operators`, `category_id` FK → `article_categories`, `cluster_id` FK → `content_clusters`, `seo_title`, `seo_description`, `seo` jsonb, `published_at`, `created_at`, `updated_at` |
| `content_product_embeds` | `article_id`, `product_id`, `position`, `variant` (`inline` \| `highlight` \| `comparison`) |

### Taxonomia editorial — `article_categories`

| Tabela | Colunas |
|--------|---------|
| `article_categories` | `id` UUID PK, `name` varchar(120), `slug` varchar(100) UNIQUE, `created_at`, `updated_at` |

Migration: [`0013_article_taxonomy_authors.sql`](../packages/infrastructure/src/persistence/drizzle/migrations/0013_article_taxonomy_authors.sql).

### SEO — `auto_links`

| Tabela | Colunas |
|--------|---------|
| `auto_links` | `keyword`, `target_url`, `max_matches`, `priority`, `is_active`, `created_at`, `updated_at` |

Seed inicial migra `SEO_KEYWORD_MAP` estático.

### Clusters editoriais — `content_clusters`

Doc: [content-clusters-hub-spoke.md](./content-clusters-hub-spoke.md).

| Tabela | Colunas |
|--------|---------|
| `content_clusters` | `name`, `slug` UNIQUE, `description`, `pilar_article_id` FK → `content_articles`, `created_at`, `updated_at` |

### Coleções — `curated_collections` / `collection_products`

| Tabela | Colunas |
|--------|---------|
| `curated_collections` | `slug` UNIQUE, `title`, `description`, `cover_image_url`, `campaign_origin`, `utm_defaults` jsonb, `cta_text`, `created_at`, `updated_at` |
| `collection_products` | `collection_id` FK, `product_id` FK, `sort_order`; UNIQUE `(collection_id, product_id)` |

### Comparador — `product_comparisons` / `comparison_products`

| Tabela | Colunas |
|--------|---------|
| `product_comparisons` | `share_token` UNIQUE, `session_id`, `editorial_intro`, `created_at` |
| `comparison_products` | `comparison_id`, `product_id`, `sort_order` |

### Cupons — `coupons`

| Coluna | Notas |
|--------|-------|
| `marketplace`, `code`, `description` | |
| `discount_value`, `discount_type` | percent ou fixed |
| `valid_from`, `valid_until` | |
| `status` | `unverified` até Pipeline D |
| `source_url` | origem verificável |
| `last_verified_at` | exibir público só se <24h |

### Telemetria — `click_events`

Writes passam por buffer Redis quando `TELEMETRY_BUFFER_ENABLED=true` (default); worker faz bulk insert periódico. Ver [telemetry-redis-buffer.md](./telemetry-redis-buffer.md).

| Coluna | Valores / notas |
|--------|-----------------|
| `product_id`, `origin`, `session_id`, `occurred_at` | `origin`: `listagem`, `detalhe`, `embed`, `comparador`, `cupons`, `coleção`, `similar`, `redirect_go` |
| `block_id` | uuid FK → `page_blocks.id`, ON DELETE SET NULL; rastreamento analítico CMS |
| `article_id` | uuid FK → `content_articles.id`, ON DELETE SET NULL; atribuição em embeds editoriais |
| `collection_id` | uuid FK → `curated_collections.id`, ON DELETE SET NULL |
| `placement` | componente concreto (`article.embed`, `cms.product_grid`, …) |
| `page_path` | rota onde o clique ocorreu |
| `referrer_path` | entrada anterior na sessão (funil editorial) |

Índices: `(block_id)`, `(occurred_at DESC)`, `(product_id, occurred_at)`, `(origin, occurred_at)`, `(article_id)`, `(placement, occurred_at)`, `(page_path, occurred_at)`, `(collection_id, occurred_at)`.

Migrations: [`0014_click_events_analytics.sql`](../packages/infrastructure/src/persistence/drizzle/migrations/0014_click_events_analytics.sql), [`0015_click_attribution.sql`](../packages/infrastructure/src/persistence/drizzle/migrations/0015_click_attribution.sql).

### Telemetria — `content_engagement_events`

| Coluna | Valores / notas |
|--------|-----------------|
| `event_type` | `article_card_click`, `article_page_view` |
| `article_id` | FK → `content_articles` |
| `page_path` | rota do evento |
| `placement` | ex.: `article_listing`, `article.related` |
| `block_id`, `referrer_path`, `session_id` | atribuição opcional |

Migration: [`0015_click_attribution.sql`](../packages/infrastructure/src/persistence/drizzle/migrations/0015_click_attribution.sql). Doc: [admin-dashboard-attribution-phase2.md](./admin-dashboard-attribution-phase2.md).

### Ops — `sync_job_logs` / `affiliate_accounts` / `operators`

| Tabela | Uso |
|--------|-----|
| `sync_job_logs` | auditoria pipelines worker |
| `affiliate_accounts` | tag afiliado por marketplace (único); `status` inclui `pending_manual_validation`; `validation_notes` |
| `marketplace_api_credentials` | chaves de API criptografadas por marketplace (unique); `health_status`, `public_metadata` — ver [admin-marketplace-credentials.md](./admin-marketplace-credentials.md) |
| `site_settings` | single-row JSONB — feature flags CMS/plataforma (ver [admin-operational-settings.md](./admin-operational-settings.md)) |
| `operators` | operadores CMS; `email` único, `avatar_url`, `bio` varchar(250), `role` enum (`admin`, `editor`), `status` enum (`active`, `disabled`), `job_title`, `social_links` jsonb, `show_on_team`, `team_sort_order`, `team_public_role` enum (`founder`, `member`) |

Migrations: [`0004_operators.sql`](../packages/infrastructure/src/persistence/drizzle/migrations/0004_operators.sql), [`0017_operator_public_profile.sql`](../packages/infrastructure/src/persistence/drizzle/migrations/0017_operator_public_profile.sql), [`0018_institutional_pages.sql`](../packages/infrastructure/src/persistence/drizzle/migrations/0018_institutional_pages.sql).

## Seed de desenvolvimento

Arquivo: [`packages/infrastructure/src/persistence/drizzle/seed.ts`](../packages/infrastructure/src/persistence/drizzle/seed.ts).

O seed é **bifurcado por ambiente**:

| Ambiente | Comando | Conteúdo |
|----------|---------|----------|
| Desenvolvimento (`NODE_ENV≠production`) | `npm run db:seed` | Bootstrap + catálogo demo (produtos, afiliados, artigos, coleções, cupons, clusters) |
| Produção (`NODE_ENV=production`) | `SEED_FORCE=true npm run db:seed` | **Somente bootstrap** — operador admin, `site_settings`, home CMS mínima, página Sobre, auto-links, taxonomia de artigos |

### Bootstrap (produção e dev)

| Entidade | ID fixo (exemplo) | Notas |
|----------|-------------------|-------|
| Operador admin | `90111111-...` | email em `ADMIN_SEED_EMAIL`; em produção sem avatar/bio demo |
| Page home | `f1111111-...` | layout mínimo em produção (hero + grids vazios); layout completo em dev |
| Page sobre | `f2222222-...` | conteúdo institucional default da marca |
| Categorias de artigos | `ac111111-...` | Guias, Reviews, Comparativos |

### Demo (somente desenvolvimento)

| Entidade | ID fixo (exemplo) | Slug / identificador |
|----------|-------------------|----------------------|
| Produto Amazon | `a1111111-...` | `cadeira-ergonomica-home-office` |
| Produto Shopee | `a2222222-...` | `headset-gamer-7-1` |
| Contas afiliado | `e1111111-...` | tags demo (`vitrine-21`, etc.) |
| Artigo | `b1111111-...` | `guia-cadeira-ergonomica` |
| Coleção | `c1111111-...` | `setup-gamer-iniciante` |
| Cupom | `d1111111-...` | `VITRINE10` |
| Blocos CMS dev | `f2111111-...` … | ver [cms-home-phase1.md](./cms-home-phase1.md) |

Produção: seed ignorado salvo `SEED_FORCE=true` (primeiro deploy via `deploy/scripts/seed.sh` ou workflow `run_seed: true`).

## Convenções

- IDs: uuid v4 (`gen_random_uuid()`)
- Timestamps: `timestamptz`
- Dinheiro: `decimal(12,2)` no DB; `number` nos DTOs da API
- JSONB para props CMS, SEO, specs, tags — validados por Zod na aplicação
