Com base nos PRDs ([PRD Core](.cursor/plans/prd_plataforma_afiliação_de44933f.plan.md), [PRD Growth](.cursor/plans/prd_growth_aquisicao_trafego.plan.md)), no inventário em [`docs/llm-context-03-implemented-features.md`](docs/llm-context-03-implemented-features.md) e no código atual, o panorama é: **backend e vitrine editorial estão bem avançados**; **retenção, páginas-ímã e operação de escala** são onde o MVP ainda não fecha.

---

## Resumo executivo

| Área                                                                                                 | Status                                   |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Catálogo local, workers, API REST core                                                               | ✅ Implementado                          |
| Vitrine: home CMS, produtos, categorias, artigos, coleções, `/go`                                    | ✅ Implementado                          |
| Admin: produtos, artigos, categorias, coleções, CMS blocos, auto-links, clusters                     | ✅ Implementado                          |
| **Comparador standalone** (`/comparar`), **central `/cupons`**, **alertas UI**, **gráfico de preço** | Comparador ✅; cupons/alertas/gráfico ❌ |
| **Batch checkout** na wishlist, **LGPD alertas**, **banner cookies**                                 | ❌ Parcial/ausente                       |
| **Gate afiliado**, **PA-API em escala**, **calendário editorial**                                    | ⏳ Negócio/ops                           |

---

## 1. Critérios de aceite do MVP (PRD Core §7) — ainda em aberto

Estes itens do PRD Core **não estão completos** end-to-end:

| Critério                                     | Backend                                    | Web/UI                                                                                          |
| -------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Gráfico de histórico (≥7 snapshots)          | `GET /products/:id/price-history` ✅       | Sem componente na página de produto ❌                                                          |
| Wishlist com batch redirect                  | `POST /wishlist/checkout-batch` ✅         | Drawer com CTA batch + consentimento cookies ✅                                                 |
| Alerta de preço (double opt-in + disparo)    | API + worker ✅                            | Formulário na vitrine ❌; cancelamento LGPD ✅                                                  |
| Comparador 2–3 produtos + URL compartilhável | `POST/GET /comparisons` ✅                 | `/comparar` + seletor nos cards ✅ — ver [comparator-web-phase1.md](./comparator-web-phase1.md) |
| Central de cupons + Pipeline D               | Worker `coupon_verify` + `GET /coupons` ✅ | Sem `/cupons`; admin é stub ❌                                                                  |

O que **já fecha** critérios: catálogo local, CTA/disclaimer, hub com embeds dinâmicos, coleções (`/colecoes/[slug]`), tracking de cliques.

**Nota:** comparativos **dentro de artigos** (`[[compare:...]]` + `ComparisonTable`) já existem — isso cobre parte do Growth, mas **não** o comparador standalone indexável do PRD (`/comparar/[token]`).

---

## 2. PRD Core — funcionalidades de retenção (§3)

### 3.1 Histórico de preços

- Snapshots e API: prontos.
- **Falta:** gráfico 30/90/180 dias na página de produto, badges derivados (“menor preço em 30 dias”) ligados ao histórico na UI.

### 3.2 Alertas de queda de preço

- **Falta na vitrine:** botão “Criar alerta”, fluxo de confirmação por e-mail, página de sucesso.
- **Falta na API:** `DELETE /price-alerts/:token` (LGPD — link no e-mail para exclusão).
- **Produção:** configurar Resend (`RESEND_API_KEY`) e validar conta afiliado `active` antes de escala (gate §4.2).

### 3.3 Wishlist / batch checkout

- **Parcial:** coração no header, drawer por marketplace, add/remove ✅.
- **Falta:** CTA “Finalizar na Amazon (N itens)” chamando `checkout-batch`; limpeza de itens `delisted`; banner de cookies LGPD para sessão anônima.

### 3.4 Comparador lado a lado

- **Entregue:** toggle nos cards, barra flutuante, `/comparar?p=` e `/comparar/[param]` — [comparator-web-phase1.md](./comparator-web-phase1.md); gestão editorial admin — [admin-comparisons-phase1.md](./admin-comparisons-phase1.md)

### 3.5 Central de cupons

- **Falta:** página `/cupons` (+ sub-rotas Growth `/cupons/shopee`, `/cupons/amazon`), FAQ editorial, recirculação pós-cópia, bloco CMS `COUPON_STRIP` funcional (hoje é placeholder).
- **Admin:** `/cupons` é stub (“em breve”) — CRUD operacional de cupons.

---

## 3. PRD Core — governança e infra (§4)

| Item                                                         | Status                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Gate manual conta afiliado (`pending_manual_validation`)     | Parcial — bloqueia redirect `/go`; checklist operacional ainda pendente                           |
| PA-API Amazon homologada / sync automático em escala         | Modo híbrido: operador cadastra produto manualmente; worker enriquece                             |
| Auto-mapeamento browse node → categoria (Pipeline C)         | Colunas existem; **worker não implementado**                                                      |
| Cache/proxy de imagens (TTL 7d)                              | Não evidenciado como feature completa                                                             |
| Produto `delisted` → 410/redirect SEO                        | Não implementado na web                                                                           |
| Dashboard operacional (stale rate, filas, alertas pendentes) | Parcial — admin dashboard com cliques/catálogo/GA4 Data API ✅; alertas de ops do PRD incompletos |
| Budget de rate limit inteligente                             | Workers existem; governança fina por tier de vendas não documentada como entregue                 |

---

## 4. PRD Growth — tráfego e conteúdo

### Implementado

- Hub de artigos (`/artigos`, filtros, embeds, auto-links, clusters Hub & Spoke).
- Coleções curadas (`/colecoes/[slug]`) — URL é `/colecoes/` (não `/c/` do wireframe original).
- SEO técnico (sitemap, robots, JSON-LD) via plano `full_platform_seo_audit` ✅.
- Páginas institucionais `/sobre` e `/contato` ✅.

### Pendente (Growth)

**Páginas-ímã (alta prioridade no calendário Fase 1 do Growth):**

- Central `/cupons` com conteúdo único + FAQ.
- Comparador indexável como landing própria — `/comparar/[shareToken]` (ver [comparator-web-phase1.md](./comparator-web-phase1.md))
- Link “Cupons” no header (previsto no plano `header_gold_hub`; header atual só tem Artigos + Sobre).

**Operação editorial (não é código, mas está no PRD Growth):**

- Mapa de keywords dos primeiros 20 artigos.
- Templates + checklist anti-duplicação operacional.
- Playbook Pinterest/TikTok/Instagram com UTMs.
- Processo de curadoria de cupons 2×/dia.
- Calendário 90 dias (Fases 0–3).
- Indexação massiva bloqueada até conta afiliado `active`.

**SEO/recirculação Growth:**

- Detalhe de produto linkando para guias (“Leia nosso guia completo”).
- Meta description com faixa de preço 30d quando houver histórico.
- Busca no header (botão existe, sem implementação).
- Email opcional “avisar novos cupons” (lead gen).

---

## 5. Admin e CMS — gaps pós-fases entregues

| Item                                                              | Status                                                                  |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Draft / preview / publish CMS (`POST /admin/pages/:slug/publish`) | ❌                                                                      |
| Drag-and-drop de blocos                                           | ❌ (reorder por botões ↑↓)                                              |
| Forms CMS fase 2: `HERO_SPLIT`, `COUPON_STRIP`                    | ❌ (“Edição amigável em breve”)                                         |
| `CURATED_COLLECTION` no admin                                     | ✅ (form existe)                                                        |
| Admin CRUD cupons                                                 | ❌ stub                                                                 |
| Admin configurações operacionais                                  | ✅ ver [admin-operational-settings.md](./admin-operational-settings.md) |
| Editor CMS página Sobre (`/paginas/sobre`)                        | ✅ ver [admin-about-page.md](./admin-about-page.md)                     |

---

## 6. Planos derivados ainda não executados

| Plano                                                                                   | O que falta                                                                                                                                   |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [`analytics_integration_ga4`](.cursor/plans/analytics_integration_ga4_bec34d62.plan.md) | GA4 na vitrine web (`@next/third-parties`, eventos `trackAffiliateClick`, views produto/artigo) — hoje só first-party + GA4 Data API no admin |
| [`about_contact_pages`](.cursor/plans/about_contact_pages_d59258c4.plan.md)             | Concluído (editor Admin fase 5)                                                                                                               |

Planos já **completed** incluem: arquitetura, home CMS, produtos/artigos admin, go-redirect, SEO audit, content clusters, comparativos em artigos, navegação instantânea, security hardening, etc.

---

## 7. Priorização sugerida (ordem natural do PRD)

Se a meta é **fechar o MVP obrigatório** do North Star:

1. **Central `/cupons`** — API + Pipeline D prontos; falta front + admin CRUD.
2. **Alertas de preço na vitrine** + `DELETE /price-alerts/:token` + Resend em staging/prod.
3. **Gráfico de histórico** na página de produto.
4. **Batch checkout** no `WishlistDrawer`.
5. **LGPD:** banner cookies + exclusão de alertas/lista.
6. **CMS publish/draft** e forms `HERO_SPLIT` / `COUPON_STRIP`.
7. **GA4 web** (complementar ao tracking first-party).
8. **Negócio/infra:** validar contas afiliado, PA-API, auto-mapeamento browse node.

---

## Fora de escopo MVP (não contar como “próximo passo” técnico)

Login social, app nativo, checkout in-platform, comparador cross-marketplace mesmo SKU, sub-afiliados, automação de postagem social — todos explicitamente **fora do MVP** nos PRDs.

---

O [`docs/plans-index.md`](docs/plans-index.md) está **desatualizado** (ainda cita produtos/artigos web como pendentes). Para gap analysis, use [`docs/llm-context-03-implemented-features.md`](docs/llm-context-03-implemented-features.md) § “MVP — o que ainda falta” como referência viva.

Se quiser, posso detalhar um roadmap só para **uma** dessas frentes (ex.: comparador ou cupons) com arquivos e rotas específicos a criar — em Agent mode dá para implementar.
