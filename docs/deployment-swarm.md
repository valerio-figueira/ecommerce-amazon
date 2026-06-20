# Deploy Docker Swarm + GitHub Actions

Produção MVP em VPS único (Debian 12) com **Docker Swarm**, roteamento por caminho via **Traefik** e CI/CD em **GitHub Actions** (environment `production`).

## Por quê

- Validar o MVP em um VPS (2 vCPU / 4 GB) sem depender de PaaS
- Mesmos paths em fase IP e fase domínio: `/`, `/api/*`, `/admin/*`
- Imagens no GHCR; secrets injetados via GitHub; deploy por SSH

Plano de referência: [`.cursor/plans/docker_swarm_mvp_deploy_193167d2.plan.md`](../.cursor/plans/docker_swarm_mvp_deploy_193167d2.plan.md)

## Arquitetura

```
Visitante → Traefik :80 (ou :443 com TLS)
              ├─ /           → web:3001
              ├─ /api/*      → api:3000  (StripPrefix /api)
              └─ /admin/*    → admin:3002 (Next basePath /admin)

api/worker → postgres, redis (rede overlay interna)
```

### Fases de exposição

| Fase     | `TLS_ENABLED` | `PUBLIC_BASE_URL`        | Acesso                |
| -------- | ------------- | ------------------------ | --------------------- |
| IP (MVP) | `false`       | `http://SEU_IP`          | HTTP porta 80         |
| Domínio  | `true`        | `https://seudominio.com` | HTTPS (Let's Encrypt) |

Let's Encrypt **não emite certificado para IP** — TLS só após DNS apontando para a VPS.

## Arquivos do repositório

| Caminho                                   | Função                                                 |
| ----------------------------------------- | ------------------------------------------------------ |
| `docker/Dockerfile.*`                     | Imagens multi-stage (api, worker, web, admin, migrate) |
| `deploy/docker-stack.yml`                 | Stack Swarm (template `envsubst`)                      |
| `deploy/traefik/traefik.http.yml`         | Traefik HTTP-only (fase IP)                            |
| `deploy/traefik/traefik.https.yml`        | Traefik HTTPS + ACME (fase domínio)                    |
| `deploy/scripts/bootstrap-vps.sh`         | Setup único do VPS                                     |
| `deploy/scripts/render-env.sh`            | Gera `/opt/vitrine/.env`                               |
| `deploy/scripts/deploy.sh`                | Pull → stack deploy → migrate → smoke tests            |
| `deploy/scripts/migrate.sh` / `seed.sh`   | Jobs one-shot                                          |
| `.github/workflows/ci.yml`                | PR: lint + testes                                      |
| `.github/workflows/deploy-production.yml` | main: build GHCR + deploy SSH                          |

## Bootstrap do VPS (uma vez)

```bash
# Como root na VPS Debian 12
curl -fsSL https://raw.githubusercontent.com/SEU_ORG/SEU_REPO/main/deploy/scripts/bootstrap-vps.sh | bash
# ou copie o script e execute:
bash deploy/scripts/bootstrap-vps.sh
```

Depois:

1. Adicionar chave SSH pública do usuário `deploy` em `~deploy/.ssh/authorized_keys`
2. Criar environment **`production`** no GitHub com os secrets abaixo
3. Gerar PAT `read:packages` → secret `GHCR_PULL_TOKEN` (pull na VPS)
4. Disparar workflow **Deploy Production** com `run_seed: true` no primeiro deploy (bootstrap: operador, settings, home mínima — **sem** produtos/contas afiliado demo)

## Secrets GitHub (environment `production`)

### Infra / deploy

| Secret                | Exemplo            | Notas                                                      |
| --------------------- | ------------------ | ---------------------------------------------------------- |
| `VPS_SSH_HOST`        | `185.x.x.x`        | IP ou hostname SSH                                         |
| `VPS_SSH_USER`        | `deploy`           |                                                            |
| `VPS_SSH_PRIVATE_KEY` | PEM                | Chave privada completa                                     |
| `PUBLIC_BASE_URL`     | `http://185.x.x.x` | **Sem** barra final; muda para `https://dominio` na fase 2 |
| `TLS_ENABLED`         | `false`            | `true` após DNS + domínio                                  |
| `ACME_EMAIL`          | `ops@dominio.com`  | Obrigatório se `TLS_ENABLED=true`                          |
| `GHCR_PULL_TOKEN`     | PAT                | `read:packages` para `docker pull` na VPS                  |

### URLs derivadas (automáticas em `render-env.sh`)

A partir de `PUBLIC_BASE_URL`:

- `NEXT_PUBLIC_API_URL` = `{PUBLIC_BASE_URL}/api`
- `WEB_PUBLIC_URL` / `NEXT_PUBLIC_SITE_URL` = `{PUBLIC_BASE_URL}`
- `STORAGE_PUBLIC_BASE_URL` = `{PUBLIC_BASE_URL}/api/uploads`
- `CORS_ORIGINS` = `{PUBLIC_BASE_URL}` (ou override manual)

Interno (Swarm): `API_INTERNAL_URL=http://api:3000`, `POSTGRES_HOST=postgres`, `REDIS_HOST=redis`

### App / segurança

| Secret                                                                 | Notas                                                                                         |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`                    |                                                                                               |
| `JWT_SECRET`, `PASSWORD_PEPPER`, `ENCRYPTION_KEY`, `REVALIDATE_SECRET` | Rotacionar defaults de dev                                                                    |
| `SITE_NAME`, `COMPANY_LEGAL_NAME`, `CONTACT_EMAIL`, `SITE_TAGLINE`     |                                                                                               |
| `AMAZON_AFFILIATE_TAG`, `SHOPEE_AFFILIATE_ID`                          |                                                                                               |
| `EMAIL_FROM`, `RESEND_API_KEY`                                         |                                                                                               |
| `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`                              | Só primeiro deploy com seed (cria operador admin; configure contas afiliado no painel depois) |
| `GA4_PROPERTY_ID`, `GA4_SERVICE_ACCOUNT_JSON`                          | Opcional                                                                                      |

## Pipeline GitHub Actions

### `ci.yml` (pull requests)

Lint, format, testes unitários e integração (Postgres + Redis como service containers).

### `deploy-production.yml` (push `main` + manual)

1. **quality** — igual ao CI
2. **build_and_push** — matrix: api, worker, web, admin, migrate → `ghcr.io/<owner>/vitrine-<app>:sha-<commit>`
3. **deploy_production** — SCP `deploy/` → VPS, `render-env.sh`, `deploy.sh`, seed opcional

**Importante:** alterar `PUBLIC_BASE_URL` exige **rebuild** de `web` e `admin` (URLs `NEXT_PUBLIC_*` no build).

## Operação na VPS

```bash
# Logs
docker service logs -f vitrine_api
docker service logs -f vitrine_worker

# Status
docker stack services vitrine

# Rollback de um serviço
docker service rollback vitrine_api

# Backup Postgres (manual)
docker exec $(docker ps -q -f name=vitrine_postgres) \
  pg_dump -U vitrine vitrine > backup.sql
```

Diretórios na VPS:

- `/opt/vitrine/.env` — env gerado (600)
- `/opt/vitrine/traefik/traefik.yml` — config ativa
- `/opt/vitrine/stack/docker-stack.rendered.yml` — stack renderizado

## Migrar IP → domínio + HTTPS

1. DNS `A` de `seudominio.com` → IP da VPS
2. Atualizar secrets: `PUBLIC_BASE_URL=https://seudominio.com`, `TLS_ENABLED=true`, `ACME_EMAIL=...`
3. `ufw allow 443/tcp` na VPS
4. Redeploy (push ou workflow_dispatch) — rebuild web/admin + Traefik HTTPS
5. Validar: `https://seudominio.com/api/health/ready`, `https://seudominio.com/admin/login`

Paths **não mudam** — só scheme e host.

## Troubleshooting

| Sintoma           | Causa provável                           | Ação                                               |
| ----------------- | ---------------------------------------- | -------------------------------------------------- |
| 404 em `/admin`   | `ADMIN_BASE_PATH` ausente no build admin | Rebuild imagem admin com `/admin`                  |
| 404 em `/api/...` | StripPrefix ou API down                  | `curl` interno + logs `vitrine_api`                |
| CORS no browser   | `CORS_ORIGINS` sem origem exata          | Usar `PUBLIC_BASE_URL` sem path                    |
| ACME falhou       | DNS não propagado ou :80 bloqueado       | Checar `ufw`, DNS, logs Traefik                    |
| OOM 4 GB          | Limites de memória                       | Reduzir réplicas ou `TELEMETRY_BUFFER_MAX_LEN`     |
| Migrate falhou    | Postgres não pronto                      | `wait-postgres.sh`; ver rede `vitrine_vitrine_net` |

## Escala futura

- `docker service scale vitrine_api=2` (stateless) — migrar uploads para S3/GCS
- Postgres/Redis managed externo — remover do stack
- Worker: manter 1 réplica até validar rate limits de marketplace

## Como testar localmente (build de imagem)

```bash
docker build -f docker/Dockerfile.api -t vitrine-api:local .
# Build args para web (simular produção por IP):
docker build -f docker/Dockerfile.web \
  --build-arg NEXT_PUBLIC_API_URL=http://127.0.0.1/api \
  --build-arg NEXT_PUBLIC_SITE_URL=http://127.0.0.1 \
  --build-arg WEB_PUBLIC_URL=http://127.0.0.1 \
  --build-arg API_INTERNAL_URL=http://api:3000 \
  --build-arg SITE_NAME=Vitrine \
  --build-arg STORAGE_PUBLIC_BASE_URL=http://127.0.0.1/api/uploads \
  -t vitrine-web:local .
```

Swarm local exige `docker swarm init` e ajuste de `PUBLIC_BASE_URL` — recomendado validar na VPS de staging.
