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
apps/worker       → BullMQ + fetchers externos
packages/domain   → entidades, ports, eventos
packages/application → use cases
packages/infrastructure → ORM, Redis, filas, email
```
