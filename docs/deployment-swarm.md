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

| Caminho                                   | Função                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `docker/Dockerfile.*`                     | Imagens multi-stage (api, worker, web, admin, migrate)                   |
| `deploy/docker-stack.yml`                 | Stack Swarm (template `envsubst`)                                        |
| `deploy/traefik/traefik.http.yml`         | Traefik HTTP-only (fase IP)                                              |
| `deploy/traefik/traefik.https.yml`        | Traefik HTTPS + ACME (fase domínio)                                      |
| `deploy/scripts/bootstrap-vps.sh`         | Setup único do VPS (Docker, UFW/DOCKER-USER, daemon.json)                |
| `deploy/scripts/render-env.sh`            | Gera `/opt/vitrine/.env` (urlencode bash, mktemp atômico, permissão 600) |
| `deploy/scripts/deploy.sh`                | Pull → stack deploy → migrate → wait apps → smoke tests                  |
| `deploy/scripts/wait-postgres.sh`         | Aguarda Postgres saudável antes de migrate                               |
| `deploy/scripts/wait-service-http.sh`     | Aguarda web/admin HTTP no container (cold start Next.js)                 |
| `deploy/scripts/wait-http-url.sh`         | Retry em URLs públicas via Traefik (smoke tests)                         |
| `deploy/scripts/migrate.sh` / `seed.sh`   | Jobs one-shot                                                            |
| `.github/workflows/ci.yml`                | PR: lint + testes                                                        |
| `.github/workflows/deploy-production.yml` | main: build GHCR + deploy SSH                                            |

## Bootstrap do VPS (uma vez)

```bash
# Como root na VPS Debian 12
curl -fsSL https://raw.githubusercontent.com/SEU_ORG/SEU_REPO/main/deploy/scripts/bootstrap-vps.sh | bash
# ou copie o script e execute:
bash deploy/scripts/bootstrap-vps.sh
```

Depois:

1. Gerar par de chaves **só para deploy** (na sua máquina local):

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/vitrine_deploy -N ""
```

2. Instalar a chave **pública** na VPS (como root ou com sudo):

```bash
# Na VPS — substitua pelo conteúdo de vitrine_deploy.pub
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
echo "ssh-ed25519 AAAA... github-actions-deploy" >> /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

3. Testar login manual (deve entrar **sem** pedir senha):

```bash
ssh -i ~/.ssh/vitrine_deploy deploy@SEU_IP
```

4. Criar environment **`production`** no GitHub e cadastrar os secrets abaixo (copie a chave **privada** inteira, incluindo `BEGIN`/`END`).

5. Gerar PAT `read:packages` → secret `GHCR_PULL_TOKEN` (pull na VPS)

6. Disparar workflow **Deploy Production** com `run_seed: true` no primeiro deploy (bootstrap: operador, settings, home mínima — **sem** produtos/contas afiliado demo)

### Chave SSH no GitHub (erro comum)

O step `Copy deploy manifests to VPS` falha com `can't connect without a private SSH key or password` quando **`VPS_SSH_PRIVATE_KEY` não está definido** (ou está vazio) no environment `production`.

| Secret                   | Valor                                                     |
| ------------------------ | --------------------------------------------------------- |
| `VPS_SSH_HOST`           | IP ou hostname da VPS (ex.: `185.x.x.x`)                  |
| `VPS_SSH_USER`           | `deploy` (usuário criado pelo bootstrap)                  |
| `VPS_SSH_PRIVATE_KEY`    | Conteúdo completo de `~/.ssh/vitrine_deploy` (multilinha) |
| `VPS_SSH_KEY_PASSPHRASE` | Opcional — só se a chave privada tiver senha              |

Para copiar a chave privada no terminal:

```bash
cat ~/.ssh/vitrine_deploy
```

Cole **tudo** no secret (não use só a linha do meio). Secrets de repositório também funcionam, mas o job `deploy_production` usa `environment: production` — cadastre no environment para manter tudo junto.

## Secrets GitHub (environment `production`)

### Infra / deploy

| Secret                   | Exemplo            | Notas                                                         |
| ------------------------ | ------------------ | ------------------------------------------------------------- |
| `VPS_SSH_HOST`           | `185.x.x.x`        | IP ou hostname SSH                                            |
| `VPS_SSH_USER`           | `deploy`           | Usuário do bootstrap                                          |
| `VPS_SSH_PRIVATE_KEY`    | PEM / OpenSSH      | Chave privada **completa** (multilinha) — ver bootstrap acima |
| `VPS_SSH_KEY_PASSPHRASE` | —                  | Opcional, se a chave tiver senha                              |
| `PUBLIC_BASE_URL`        | `http://185.x.x.x` | **Sem** barra final; muda para `https://dominio` na fase 2    |
| `TLS_ENABLED`            | `false`            | `true` após DNS + domínio                                     |
| `ACME_EMAIL`             | `ops@dominio.com`  | Obrigatório se `TLS_ENABLED=true`                             |
| `GHCR_PULL_TOKEN`        | PAT                | `read:packages` para `docker pull` na VPS                     |

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
   Usa o environment **`production`** (mesmos secrets de `PUBLIC_BASE_URL` / `SITE_NAME` que o deploy). Sem isso, os build-args de web/admin ficam vazios e o `next build` falha na coleta de páginas.
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

- `/opt/vitrine/.env` — env gerado (600); valores entre aspas/escape bash — secrets podem conter espaços, `*`, cron, JSON
- `/opt/vitrine/traefik/traefik.yml` — config ativa
- `/opt/vitrine/stack/docker-stack.rendered.yml` — stack renderizado

## Migrar IP → domínio + HTTPS

1. DNS `A` de `seudominio.com` → IP da VPS
2. Atualizar secrets: `PUBLIC_BASE_URL=https://seudominio.com`, `TLS_ENABLED=true`, `ACME_EMAIL=...`
3. `ufw allow 443/tcp` na VPS
4. Redeploy (push ou workflow_dispatch) — rebuild web/admin + Traefik HTTPS
5. Validar: `https://seudominio.com/api/health/ready`, `https://seudominio.com/admin/login`

Paths **não mudam** — só scheme e host.

## Segurança operacional (bootstrap + render-env)

Hardening aplicado nos scripts de deploy para mitigar vazamento de segredos e bypass de firewall pelo Docker.

### O que foi mitigado

| Risco                                                                 | Script             | Mitigação                                                       |
| --------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------- |
| Credenciais visíveis em `ps`/`/proc/*/cmdline` via `python3 -c '...'` | `render-env.sh`    | `urlencode()` em bash puro (sem subprocesso com argv)           |
| Race condition: `.env` criado com umask default antes de `chmod 600`  | `render-env.sh`    | `mktemp` em `${APP_DIR}` + `umask 077` + `mv -f` atômico        |
| UFW `deny incoming` contornado por portas publicadas no Docker        | `bootstrap-vps.sh` | Cadeia `DOCKER-USER` → `ufw-user-forward` (só 80/443 liberados) |
| Temp parcial em falha do render                                       | `render-env.sh`    | `trap EXIT` remove `.env.XXXXXX` e faz `unset` de segredos      |

### Invariantes de rede

- **Apenas Traefik** no [`deploy/docker-stack.yml`](../deploy/docker-stack.yml) deve ter bloco `ports:` (80 e, com TLS, 443 em `mode: host`).
- **Postgres e Redis** permanecem só na overlay `vitrine_net` — nunca adicionar `published:` nesses serviços.
- Single-node: `ufw default deny incoming` + 22/80/443 é suficiente (overlay Swarm usa `lo` internamente).
- **Multi-node futuro:** abrir também `2377/tcp`, `7946/tcp+udp`, `4789/udp` entre nós do cluster.

### Ordem UFW no bootstrap

1. `ufw --force reset`
2. `DEFAULT_FORWARD_POLICY="ACCEPT"` em `/etc/default/ufw`
3. Injetar bloco `# BEGIN vitrine-docker` em `/etc/ufw/after.rules` (**após** o reset)
4. Regras INPUT (SSH, 80) → `ufw enable` → `ufw reload`

**Nota:** comentários dentro de `/etc/ufw/*.rules` devem ser **ASCII puro** (sem acentos). O backend Python do UFW falha com `UnicodeEncodeError` se houver caracteres como `í`, `ã`, etc.

### Como validar na VPS

```bash
# Permissão do .env (após deploy)
stat -c '%a %n' /opt/vitrine/.env   # esperado: 600

# UFW ativo
ufw status verbose                   # 22, 80 allowed

# Cadeia DOCKER-USER presente
iptables -L DOCKER-USER -n -v

# Postgres/Redis não escutam na interface pública
ss -tlnp | grep -E ':5432|:6379' || echo "OK — sem listeners públicos"
```

Durante `render-env.sh`, não deve haver processo `python3` com credenciais na linha de comando.

### Re-bootstrap ou VPS já provisionada

Se a VPS foi criada **antes** deste hardening, aplique manualmente (como root):

```bash
# Copiar scripts atualizados ou clonar repo, depois:
bash deploy/scripts/bootstrap-vps.sh
```

O bootstrap é idempotente para `daemon.json`, bloco UFW e usuário `deploy`. **Atenção:** `ufw --force reset` remove regras INPUT customizadas — documente regras extras antes de reexecutar.

Alternativa mínima sem reexecutar bootstrap completo:

1. Criar `/etc/docker/daemon.json` conforme [`deploy/scripts/bootstrap-vps.sh`](../deploy/scripts/bootstrap-vps.sh) → `systemctl restart docker`
2. Injetar bloco `vitrine-docker` em `/etc/ufw/after.rules` → `ufw reload`

## Troubleshooting

| Sintoma                             | Causa provável                                           | Ação                                                                                      |
| ----------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 404 em `/` no smoke test            | Web ainda em cold start ou Traefik sem rota              | Logs `vitrine_web`; deploy agora espera ate 3 min (`wait-service-http` + `wait-http-url`) |
| 404 em `/admin`                     | `ADMIN_BASE_PATH` ausente no build admin                 | Rebuild imagem admin com `/admin`                                                         |
| 404 em `/api/...`                   | StripPrefix ou API down                                  | `curl` interno + logs `vitrine_api`                                                       |
| CORS no browser                     | `CORS_ORIGINS` sem origem exata                          | Usar `PUBLIC_BASE_URL` sem path                                                           |
| ACME falhou                         | DNS não propagado ou :80 bloqueado                       | Checar `ufw`, DNS, logs Traefik                                                           |
| UFW `UnicodeEncodeError`            | Comentários com acentos em `/etc/ufw/after.rules`        | Remover bloco `vitrine-docker`; reexecutar bootstrap atualizado (`LANG=C`)                |
| `yaml: could not find expected ':'` | `envsubst` injeta URLs/`DATABASE_URL` sem aspas no stack | Template usa `"${VAR}"` em `deploy/docker-stack.yml`                                      |
| `not a swarm manager`               | `docker swarm init` nunca rodou (bootstrap interrompido) | Na VPS como root: `docker swarm init`; ou reexecutar `bootstrap-vps.sh`                   |
| OOM 4 GB                            | Limites de memória                                       | Reduzir réplicas ou `TELEMETRY_BUFFER_MAX_LEN`                                            |
| Migrate falhou                      | Postgres não pronto                                      | `wait-postgres.sh`; ver rede `vitrine_vitrine_net`                                        |

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
