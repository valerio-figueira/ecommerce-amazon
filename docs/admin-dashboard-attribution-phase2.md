# Dashboard — Atribuição de cliques e funil editorial (Fase 2)

Plano de referência: [`.cursor/plans/dashboard_click_attribution_b14d246a.plan.md`](../.cursor/plans/dashboard_click_attribution_b14d246a.plan.md)

Relacionado: [admin-dashboard-phase1.md](./admin-dashboard-phase1.md) (cockpit base), plano GA4 web em `.cursor/plans/analytics_integration_ga4_bec34d62.plan.md`.

## O que foi entregue

### Telemetria first-party em duas camadas

1. **Cliques de afiliado** (`click_events`) — estendido com:
   - `placement` — componente concreto (`article.embed`, `cms.product_grid`, …)
   - `page_path` — rota onde o clique ocorreu
   - `referrer_path` — entrada anterior na sessão (ex.: `/artigos` após card)
   - `collection_id` — FK para coleções curadas

2. **Engajamento editorial** (`content_engagement_events`) — novo:
   - `article_card_click` — clique em card na listagem/relacionados
   - `article_page_view` — view da página `/artigos/[slug]`

### Vocabulário compartilhado

Pacote `@ecommerce-amazon/shared/analytics`:

- `ClickPlacement` — allowlist de placements para `/go`
- `EngagementEventType` — tipos de evento editorial
- Schemas Zod para POST `/events/engagement` e query params de atribuição

### API

**Público (vitrine):**

| Rota | Descrição |
|------|-----------|
| `GET /go/:slug` | Query estendida: `placement`, `pagePath`, `referrerPath`, `collectionId` |
| `POST /events/engagement` | Fire-and-forget; body `recordEngagementEventSchema` |

**Admin (JWT):**

| Rota | Descrição |
|------|-----------|
| `GET /admin/analytics/clicks/by-placement` | Breakdown por componente |
| `GET /admin/analytics/clicks/by-block` | Top blocos CMS (JOIN `page_blocks` + `pages`) |
| `GET /admin/analytics/clicks/by-page` | Top rotas (`page_path`) |
| `GET /admin/analytics/clicks/trend-by-origin` | Série diária por `origin` |
| `GET /admin/analytics/engagement/funnel` | Funil editorial + top artigos por etapa |

### Dashboard admin

Novas seções em `/` do painel:

- **Funil editorial** — cards → views → cliques afiliado + taxas
- **Tendência por origem** — multi-line chart
- **Por componente / bloco CMS / página**
- Tabela de artigos conversores com colunas **Embed** e **Comparador**

### Instrumentação web (`apps/web`)

- `lib/attribution/context.ts` — sessionStorage (TTL 30 min) para funil
- `AffiliateGoLink` + `buildGoUrl` — propagam atribuição
- `TrackEngagement` + `ArticleCard` — engajamento editorial
- Correções: wishlist (`wishlist.drawer`), comparador (`comparador`), Bento offer CTA direto, coleções CMS com `collectionId` + UTM

## Migration

`0015_click_attribution.sql` — rodar:

```bash
npm run db:migrate -w @ecommerce-amazon/infrastructure
```

## Como testar

```bash
docker compose up -d postgres redis
npm run db:migrate -w @ecommerce-amazon/infrastructure
npm run dev -w @ecommerce-amazon/api
npm run dev -w @ecommerce-amazon/web
npm run dev -w @ecommerce-amazon/admin
```

1. Abrir `/artigos` → clicar em um artigo → abrir artigo → clicar **"Ver preço na Amazon/Shopee"** no embed
2. Verificar PG:

```sql
SELECT event_type, count(*) FROM content_engagement_events GROUP BY 1;
SELECT placement, origin, count(*) FROM click_events GROUP BY 1,2;
```

3. Recarregar painel admin — funil e gráficos de atribuição

## Próximos passos

- Integração GA4 web (`affiliate_click` com mesmos params `origin` + `placement`)
- Consent Mode / banner cookies (LGPD)
- Rollup diário se volume justificar
