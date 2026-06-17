# ecommerce-amazon — Guia para Agentes

Plataforma de afiliação: **Vitrine Inteligente + Hub de Conteúdo** (Amazon BR / Shopee BR).

## Antes de implementar

1. Ler `.cursor/plans/` (PRD Core, PRD Growth, Arquitetura Técnica)
2. Seguir `.cursor/rules/` — regras ativas por contexto

## Regras Cursor (`.cursor/rules/`)

| Arquivo | Quando |
|---------|--------|
| `00-project-north-star.mdc` | Sempre — visão, MVP, escopo |
| `01-business-compliance.mdc` | Sempre — preços 24h, afiliado, LGPD |
| `02-clean-architecture.mdc` | `packages/**`, `apps/**` TypeScript |
| `03-api-rest.mdc` | `apps/api/**` |
| `04-worker-queues.mdc` | `apps/worker/**` |
| `05-domain-application.mdc` | `packages/domain`, `packages/application` |
| `06-ux-conversion.mdc` | Componentes UI (`tsx`, etc.) |
| `07-growth-seo-content.mdc` | Conteúdo, artigos, cupons, comparador |
| `08-testing-typescript.mdc` | Todo TypeScript |
| `09-code-standards.mdc` | ESLint, Prettier, English code, naming |
| `10-documentation.mdc` | Sempre — documentar entregas em `docs/` |
| `11-admin-floating-panels.mdc` | `apps/admin/**` — painéis flutuantes, listagens sem barra azul |

## Documentação implementada

Consultar **`docs/README.md`** para o índice completo. Principais referências:

| Doc | Conteúdo |
|-----|----------|
| [docs/plans-index.md](docs/plans-index.md) | Índice dos planos `.cursor/plans/` |
| [docs/architecture.md](docs/architecture.md) | Clean Architecture, camadas, cache |
| [docs/domain-model.md](docs/domain-model.md) | Entidades, enums, ports, use cases |
| [docs/database-schema.md](docs/database-schema.md) | Tabelas Drizzle, enums, seed |
| [docs/api-rest.md](docs/api-rest.md) | Contrato REST (rotas, Zod, DTOs) |
| [docs/worker-pipelines.md](docs/worker-pipelines.md) | Filas BullMQ, pipelines A–D |
| [docs/cms-home-phase1.md](docs/cms-home-phase1.md) | Home CMS, blocos, schemas, web |
| [docs/wishlist-retention-lgpd.md](docs/wishlist-retention-lgpd.md) | Batch checkout, cookies LGPD, cancelamento alertas |
| [docs/admin-app-phase1.md](docs/admin-app-phase1.md) | Painel CMS, login JWT, shell admin |
| [docs/admin-security.md](docs/admin-security.md) | Segurança admin: fail-closed, pepper, rate limit |
| [docs/admin-products-phase1.md](docs/admin-products-phase1.md) | Gestão manual de produtos, parser URL, API admin |
| [docs/admin-dashboard-phase1.md](docs/admin-dashboard-phase1.md) | Dashboard analítico: cliques, catálogo, GA4 Data API |
| [docs/admin-articles-phase1.md](docs/admin-articles-phase1.md) | CRUD artigos editoriais, TipTap, shortcodes |
| [docs/admin-profile-phase1.md](docs/admin-profile-phase1.md) | Perfil operador, avatar upload, storage plugável |
| [docs/admin-about-page.md](docs/admin-about-page.md) | Editor CMS da página Sobre (`/paginas/sobre`) |
| [docs/articles-taxonomy-phase2.md](docs/articles-taxonomy-phase2.md) | Categorias de artigos, autores, relacionados |
| [docs/articles-public-rendering.md](docs/articles-public-rendering.md) | Vitrine `/artigos/[slug]`, embeds editoriais |
| [docs/auto-links-admin.md](docs/auto-links-admin.md) | CRUD auto-links (API + UI `/auto-links`), parser SEO |
| [docs/content-clusters-hub-spoke.md](docs/content-clusters-hub-spoke.md) | Clusters Hub & Spoke — SEO Anchor, carousel, CRUD `/content-clusters` |
| [docs/dev-setup.md](docs/dev-setup.md) | Setup local |
| [docs/llm-context-01-project-architecture.md](docs/llm-context-01-project-architecture.md) | Síntese LLM: visão, arquitetura, invariantes |
| [docs/llm-context-02-domain-schema-interfaces.md](docs/llm-context-02-domain-schema-interfaces.md) | Síntese LLM: domínio, schema, interfaces |
| [docs/llm-context-03-implemented-features.md](docs/llm-context-03-implemented-features.md) | Síntese LLM: features, API, planos executados |

## Invariantes (nunca violar)

- API não chama marketplace em request de usuário
- Preço stale → sem urgência, sem alertas
- Domain não importa Fastify/Drizzle/BullMQ
- CTA transparente com nome do marketplace
- Código-fonte em inglês; strings de usuário em pt-BR
- Lint e format limpos antes de considerar tarefa concluída

## Monorepo alvo

```
apps/api          → REST read-heavy
apps/web          → Next.js vitrine (CMS-driven)
apps/admin        → Painel CMS operador
apps/worker       → BullMQ + fetchers externos
packages/domain   → entidades, ports, eventos
packages/application → use cases
packages/infrastructure → ORM, Redis, filas, email
```
