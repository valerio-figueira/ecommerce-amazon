# ecommerce-amazon

Plataforma de afiliação — **Vitrine Inteligente + Hub de Conteúdo** (Node.js + TypeScript).

## Stack

- **API:** Fastify (`apps/api`)
- **Worker:** BullMQ (`apps/worker`)
- **Domain / Application / Infrastructure:** Clean Architecture (`packages/*`)
- **PostgreSQL** + **Redis** (cache + filas)

## Quick start

```bash
cp .env.example .env
docker compose up -d
npm install
npm run build
npm run dev:api
npm run dev:worker   # separate terminal
```

Apply DB schema: `packages/infrastructure/src/persistence/drizzle/migrations/0000_initial.sql`

## Scripts

| Command              | Description               |
| -------------------- | ------------------------- |
| `npm run build`      | Build all packages        |
| `npm run dev:api`    | API on port 3000          |
| `npm run dev:worker` | Background workers        |
| `npm run test`       | Vitest unit + integration |
| `npm run lint`       | ESLint                    |

## Architecture

See `.cursor/plans/arquitetura_tecnica_node.plan.md` and `.cursor/rules/`.
