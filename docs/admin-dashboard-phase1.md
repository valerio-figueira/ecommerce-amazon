# Admin Dashboard — Fase 1 (métricas internas + GA4 Data API)

Plano de referência: [`.cursor/plans/admin_dashboard_gold_9b9f876f.plan.md`](../.cursor/plans/admin_dashboard_gold_9b9f876f.plan.md)

## O que foi entregue

Cockpit analítico em `/` do painel admin com:

- **Conversão:** total de cliques, tendência diária, top 10 produtos, distribuição por marketplace
- **Atribuição:** cliques por ponto de inserção (`origin`), top artigos conversores (`article_id` + `embed`)
- **Saúde do catálogo:** stale rate (24h) e contagem de produtos `out_of_stock`
- **GA4 Data API (Fase 2):** seção de tráfego/aquisição quando credenciais estiverem configuradas na API

**Fora de escopo:** receita afiliada em tempo real, Consent Mode, rollup worker diário.

## Telemetria — fonte única no `/go`

Antes, cada clique gerava dois eventos (`recordClick` no client + `redirect_go` no servidor). Agora:

1. `AffiliateGoLink` navega para `/go/:slug?origin=...&articleId=...` sem `POST /events/click` no client
2. `GET /go/:slug` grava **um** row em `click_events` com `origin` contextual (ou `redirect_go` para wishlist/checkout direto)

Origem `similar` identifica o carrossel de produtos similares na página de detalhe.

## Schema — `click_events`

Migration `0014_click_events_analytics.sql`:

| Coluna / índice | Uso |
|-----------------|-----|
| `article_id` | FK → `content_articles`; preenchido em embeds editoriais |
| `click_events_occurred_at_idx` | Filtro por período |
| `click_events_product_occurred_idx` | Top produtos |
| `click_events_origin_occurred_idx` | Breakdown por origem |
| `click_events_article_id_idx` | Artigos conversores |

Enum `ClickOrigin.SIMILAR = 'similar'` no domain.

## API admin (JWT)

| Rota | Descrição |
|------|-----------|
| `GET /admin/analytics/overview?from=&to=` | KPIs + tendência + saúde catálogo |
| `GET /admin/analytics/clicks/by-origin` | % cliques por `origin` |
| `GET /admin/analytics/clicks/by-marketplace` | % cliques por marketplace |
| `GET /admin/analytics/clicks/top-products?limit=10` | Ranking de produtos |
| `GET /admin/analytics/articles/converting?limit=10` | Artigos com mais cliques via embed |
| `GET /admin/analytics/traffic/acquisition` | Pageviews por canal (GA4) |
| `GET /admin/analytics/ctr/by-origin` | CTR híbrido PG + GA4 |

Query `from`/`to`: ISO datetime; default últimos 30 dias.

Filtro de cliques nas agregações: `origin != redirect_go` (defensivo).

## GA4 Data API

Variáveis na API (server-side):

```env
GA4_PROPERTY_ID=123456789
GA4_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Service account com acesso **Viewer** à propriedade GA4. Respostas cacheadas no Redis (TTL 30 min).

Sem credenciais, o dashboard exibe mensagem de configuração na seção GA4.

**Dependência:** eventos `affiliate_click` no GA4 exigem o plano [analytics_integration_ga4](../.cursor/plans/analytics_integration_ga4_bec34d62.plan.md) no `apps/web`.

## UI admin

- Rota: `apps/admin/src/app/(dashboard)/page.tsx`
- Gráficos: `recharts` em `apps/admin/src/components/analytics/`
- Seletor de período: 7d / 30d / 90d (query string `from`/`to`)

## Arquivos-chave

| Camada | Path |
|--------|------|
| Schema | `packages/infrastructure/.../schema/index.ts`, migration `0014_*` |
| Domain | `packages/domain/src/repositories/AnalyticsRepository.ts` |
| Use cases | `packages/application/src/use-cases/analytics/` |
| Infra | `drizzle-analytics.repository.ts`, `google-analytics-data.gateway.ts` |
| API | `apps/api/.../admin-analytics-routes.ts` |
| Admin | `apps/admin/src/lib/api/analytics.ts`, `components/analytics/*` |
| Web (telemetria) | `AffiliateGoLink.tsx`, `go-url.ts`, `ArticleBody.tsx` |

## Como testar

```bash
docker compose up -d postgres redis
npm run db:migrate -w @ecommerce-amazon/infrastructure
npm run dev -w @ecommerce-amazon/api
npm run dev -w @ecommerce-amazon/admin
```

1. Login em `http://localhost:3002`
2. Abrir `/` — dashboard com KPIs (podem estar zerados sem tráfego)
3. Na vitrine (`apps/web`), clicar em CTA de produto
4. Verificar no PG: `SELECT origin, article_id, count(*) FROM click_events GROUP BY 1,2`
5. Recarregar painel — gráficos atualizados

## Próximos passos

- Executar plano GA4 web (`apps/web`) para pageviews e eventos `affiliate_click`
- Banner cookies + Consent Mode v2 (LGPD)
- Rollup `click_daily_aggregates` se volume justificar
