# Setup de desenvolvimento

Guia para rodar o monorepo localmente.

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16 e Redis 7 (Docker/Podman ou serviço nativo)
- Opcional: Podman com socket user (`systemctl --user enable --now podman.socket`)

## Variáveis de ambiente

Copie [`.env.example`](../.env.example) para `.env` na raiz do monorepo.

| Variável | Default | Uso |
|----------|---------|-----|
| `POSTGRES_*` | `localhost:5432`, user `vitrine` | Catálogo |
| `REDIS_*` | `localhost:6379` | Cache + filas |
| `API_PORT` | `3000` | Fastify |
| `WEB_PORT` | `3001` | Next.js vitrine |
| `ADMIN_PORT` | `3002` | Painel CMS (`apps/admin`) |
| `JWT_SECRET` | (dev placeholder) | JWT operador — **mesmo valor** na API e no admin; o admin lê `.env` da raiz via `next.config.ts` |
| `JWT_EXPIRES_IN` | `8h` | Expiração JWT |
| `ADMIN_SEED_EMAIL` | `admin@vitrine.local` | Operador seed |
| `ADMIN_SEED_PASSWORD` | `vitrine-admin` | Senha operador seed |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Fetch do browser/SSR |
| `API_INTERNAL_URL` | `http://localhost:3000` | Rewrite `/go/:slug` no Next.js |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` | URLs absolutas no JSON-LD |
| `CORS_ORIGINS` | `http://localhost:3001,...` | Origens explícitas na API (incluir `:3002` para admin) |
| `REVALIDATE_SECRET` | (vazio desliga) | Secret compartilhado API → `POST /api/revalidate` no web |
| `WEB_PUBLIC_URL` | `http://localhost:${WEB_PORT}` | Base URL da vitrine para revalidação on-demand |
| `NEXT_ALLOWED_DEV_ORIGINS` | — | IP LAN para assets Next dev (ex.: `192.168.100.6`) |

## Infraestrutura (Postgres + Redis)

### Podman rootless (recomendado sem sudo)

```bash
npm run infra:up
npm run db:setup
```

Usa [`scripts/compose.sh`](../scripts/compose.sh) (`podman compose`).

### Docker

Adicione seu usuário ao grupo `docker` e reinicie a sessão:

```bash
bash scripts/add-user-to-docker.sh   # sudo usermod -aG docker
newgrp docker
docker compose up -d postgres redis
npm run db:setup
```

### PostgreSQL nativo (porta 5432 ocupada)

Se o Fedora já roda `postgresql` em 5432:

```bash
npm run db:init    # cria role/db vitrine (sudo uma vez)
npm run db:setup
```

Diagnóstico:

```bash
npm run db:doctor
```

## Aplicações

```bash
# Terminal 1
npm run dev:api

# Terminal 2
npm run dev:web

# Terminal 3 (painel CMS)
npm run dev:admin
```

- Web: http://localhost:3001  
- Admin: http://localhost:3002/login (credenciais seed: `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`)  
- API: http://localhost:3000/health  

## CORS

A API valida `Origin` via [`createCorsOriginDelegate`](../packages/shared/src/cors.ts):

- **Produção:** lista em `CORS_ORIGINS`
- **Development:** aceita também `localhost`, `127.0.0.1` e IPs LAN (`192.168.x.x`) nas portas 3000/3001/3002

Se acessar o web por IP de rede, reinicie a API após alterar `.env`.

## Build e testes

```bash
npm run build
npm run test
npm run lint
```

Ordem de build TypeScript: `domain` → `shared` → `application` → `infrastructure` → apps.

## Troubleshooting

| Sintoma | Causa comum | Ação |
|---------|-------------|------|
| Auth failed `vitrine@5432` | Postgres errado ou user inexistente | `npm run db:doctor` |
| Docker permission denied | Usuário fora do grupo `docker` | `bash scripts/add-user-to-docker.sh` |
| Container Postgres sem porta | Sistema ocupa 5432 | `sudo systemctl stop postgresql` + `docker compose down && up -d` |
| CORS no browser | Origin LAN vs localhost | Reiniciar API; conferir `CORS_ORIGINS` |
| `crypto.randomUUID` | HTTP via IP (contexto não seguro) | Usar localhost ou fallback em `session.ts` |

## Scripts utilitários

| Script | Função |
|--------|--------|
| `scripts/compose.sh` | Podman compose wrapper |
| `scripts/init-local-postgres.sh` | Role/database vitrine no Postgres nativo |
| `scripts/db-doctor.sh` | Diagnóstico de porta e auth |
| `scripts/add-user-to-docker.sh` | Adiciona user ao grupo docker |
