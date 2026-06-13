# Documentação — ecommerce-amazon

Documentação do **código implementado**. Especificação e roadmap permanecem em [`.cursor/plans/`](../.cursor/plans/).

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [dev-setup.md](./dev-setup.md) | Ambiente local, PostgreSQL, Redis, Docker/Podman, env, troubleshooting |
| [cms-home-phase1.md](./cms-home-phase1.md) | Home CMS-driven: domain, API, seed, `apps/web`, blocos, wishlist, tracking |

## Apps do monorepo

| App / pacote | Função |
|--------------|--------|
| `apps/api` | REST read-heavy (Fastify) |
| `apps/web` | Vitrine Next.js 15 — Home via PageRenderer |
| `apps/worker` | Filas BullMQ, sync marketplace |
| `packages/domain` | Entidades, enums, ports |
| `packages/application` | Use cases |
| `packages/infrastructure` | Drizzle, Redis, repositórios |
| `packages/shared` | Env, Zod CMS schemas, CORS helpers |

## Comandos rápidos

```bash
npm run infra:up      # Postgres + Redis (Podman rootless)
npm run db:setup      # migrate + seed
npm run dev:api       # API :3000
npm run dev:web       # Web :3001
npm run build         # build completo
npm run test          # Vitest
```

## Regras para agentes

Ver [AGENTS.md](../AGENTS.md) e [`.cursor/rules/`](../.cursor/rules/) — incluindo `10-documentation.mdc` (documentar toda entrega nova).
