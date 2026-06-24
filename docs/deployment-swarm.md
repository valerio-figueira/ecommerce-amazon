# Deploy Docker Swarm + GitHub Actions

Produção MVP em VPS único (Debian 12) com **Docker Swarm**, roteamento por caminho via **Traefik** e CI/CD em **GitHub Actions** (environment `production`).

## Por quê

- Validar o MVP em um VPS (2 vCPU / 4 GB) sem depender de PaaS
- **Subdomínios** em produção com domínio: vitrine, `api.` e `admin.`; fase IP mantém paths `/api` e `/admin`
- Imagens no GHCR; secrets injetados via GitHub; deploy por SSH

Plano de referência: [`.cursor/plans/docker_swarm_mvp_deploy_193167d2.plan.md`](../.cursor/plans/docker_swarm_mvp_deploy_193167d2.plan.md)

## Arquitetura

### Produção com domínio (`DEPLOY_ROUTING_MODE=subdomain`)

`PUBLIC_BASE_URL` = vitrine canônica (ex.: `https://www.seudominio.com.br`). URLs derivadas em `render-env.sh`:

| Serviço | URL pública                       |
| ------- | --------------------------------- |
| Vitrine | `PUBLIC_BASE_URL`                 |
| API     | `https://api.seudominio.com.br`   |
| Admin   | `https://admin.seudominio.com.br` |

```
Visitante → Traefik :80 / :443
              ├─ Host www.seudominio.com.br (+ apex redirect) → web:3001
              ├─ Host api.seudominio.com.br                    → api:3000
              └─ Host admin.seudominio.com.br                  → admin:3002 (sem basePath)

api/worker → postgres, redis (rede overlay interna)
```

### Fase IP (`DEPLOY_ROUTING_MODE=path`)

```
Visitante → Traefik :80
              ├─ /           → web:3001
              ├─ /api/*      → api:3000  (StripPrefix /api)
              └─ /admin/*    → admin:3002 (Next basePath /admin)
```

### Fases de exposição

| Fase     | `TLS_ENABLED` | `PUBLIC_BASE_URL`               | Acesso                                |
| -------- | ------------- | ------------------------------- | ------------------------------------- |
| IP (MVP) | `false`       | `http://SEU_IP`                 | HTTP porta 80                         |
| Domínio  | `true`        | `https://www.seudominio.com.br` | HTTPS + subdomínios `api.` / `admin.` |

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
| `deploy/scripts/prune-docker-images.sh`   | Remove tags `sha-*` antigas de vitrine-\* após deploy bem-sucedido       |
| `deploy/scripts/ensure-bootstrap-seed.sh` | Seed automatico se home CMS ou operador admin ausente (pos-migrate)      |
| `deploy/scripts/tls-hosts.sh`             | Resolução www/apex, subdomínios api./admin., labels Traefik              |
| `deploy/scripts/migrate.sh` / `seed.sh`   | Jobs one-shot (`docker-env-passthrough.sh` repassa env após `source`)    |
| `deploy/scripts/verify-operator-seed.sh`  | Valida operador vs `ADMIN_SEED_*` + `PASSWORD_PEPPER`                    |
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

6. Disparar workflow **Deploy Production** — o primeiro deploy executa **bootstrap seed automaticamente** se a home CMS ainda nao existir (operador via `ADMIN_SEED_*`, layout home minimo). Opcional: `run_seed: true` no dispatch forca re-seed idempotente.

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

A partir de `PUBLIC_BASE_URL` (ex.: `https://www.seudominio.com.br`):

| Variável                                  | Domínio (subdomain)                       | Fase IP                         |
| ----------------------------------------- | ----------------------------------------- | ------------------------------- |
| `API_PUBLIC_URL` / `NEXT_PUBLIC_API_URL`  | `https://api.seudominio.com.br`           | `{PUBLIC_BASE_URL}/api`         |
| `ADMIN_PUBLIC_URL`                        | `https://admin.seudominio.com.br`         | `{PUBLIC_BASE_URL}/admin`       |
| `WEB_PUBLIC_URL` / `NEXT_PUBLIC_SITE_URL` | `{PUBLIC_BASE_URL}`                       | idem                            |
| `STORAGE_PUBLIC_BASE_URL`                 | `{API_PUBLIC_URL}/uploads` (filesystem)   | `{PUBLIC_BASE_URL}/api/uploads` |
| `STORAGE_DRIVER`                          | `filesystem` (default) ou `s3`            | idem                            |
| `CORS_ORIGINS`                            | vitrine + admin (+ apex/www se aplicável) | `{PUBLIC_BASE_URL}`             |
| `DEPLOY_ROUTING_MODE`                     | `subdomain`                               | `path`                          |

Interno (Swarm): `API_INTERNAL_URL=http://api:3000`, `POSTGRES_HOST=postgres`, `REDIS_HOST=redis`

O servico **`admin`** no stack recebe em runtime `API_INTERNAL_URL`, `JWT_SECRET` e `JWT_EXPIRES_IN` (BFF de login e validacao de sessao na rede overlay — sem hairpin pela URL publica).

O servico **`web`** tambem recebe `API_INTERNAL_URL` em runtime (`http://api:3000`). O SSR da vitrine **nunca** deve chamar `api.seudominio.com.br` de dentro do container — hairpin/NAT no VPS causa `UND_ERR_CONNECT_TIMEOUT`, HTTP 500 na home, healthcheck falhando e task `web` em shutdown (Traefik responde `404 page not found` em texto puro).

Camadas de protecao no codigo:

1. `resolveApiBaseUrl()` — no servidor em producao usa overlay (`http://api:3000`), mesmo se `API_INTERNAL_URL` faltar no env.
2. `GET /api/health` — healthcheck do Swarm nao depende do CMS nem da API publica.
3. `getHomeLayout()` e `fetchPageLayoutOrNull()` — falhas de rede viram fallback (home vazia), nao 500.
4. `deploy/scripts/smoke-web-internal-api.sh` — apos deploy, valida overlay + SSR `/` dentro do container.

### App / segurança

| Secret                                                                 | Notas                                                                                                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`                    |                                                                                                                                       |
| `JWT_SECRET`, `PASSWORD_PEPPER`, `ENCRYPTION_KEY`, `REVALIDATE_SECRET` | Rotacionar defaults de dev; **web** e **api** precisam do mesmo `REVALIDATE_SECRET` — **uma linha só**, sem quebra ao colar no GitHub |
| `WEB_INTERNAL_URL`                                                     | `http://web:3001` no Swarm — API chama revalidate na overlay (não via Traefik)                                                        |
| `SITE_NAME`, `COMPANY_LEGAL_NAME`, `CONTACT_EMAIL`, `SITE_TAGLINE`     |                                                                                                                                       |
| `AMAZON_AFFILIATE_TAG`, `SHOPEE_AFFILIATE_ID`                          |                                                                                                                                       |
| `EMAIL_FROM`, `RESEND_API_KEY`                                         |                                                                                                                                       |
| `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`                              | Cria/atualiza operador no bootstrap seed; obrigatorios se usar seed automatico                                                        |
| `GA4_PROPERTY_ID`, `GA4_SERVICE_ACCOUNT_JSON`                          | Opcional                                                                                                                              |
| `STORAGE_DRIVER`                                                       | `filesystem` (default) ou `s3` — ver secao Object storage abaixo                                                                      |
| `AWS_S3_BUCKET`, `AWS_S3_REGION`                                       | Obrigatorios quando `STORAGE_DRIVER=s3`                                                                                               |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`                           | Credenciais IAM com `s3:PutObject` / `s3:DeleteObject` no bucket                                                                      |
| `STORAGE_PUBLIC_BASE_URL` (opcional com S3)                            | URL publica dos uploads; default `https://{bucket}.s3.{region}.amazonaws.com`                                                         |

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

# Smoke revalidate (API → web overlay, mesmo fluxo do admin save)
bash /opt/vitrine/deploy/scripts/smoke-revalidate.sh

# Rollback de um serviço
docker service rollback vitrine_api

# Limpeza manual de imagens antigas (mesmo fluxo do fim do deploy)
DOCKER_IMAGE_PRUNE_ENABLED=true IMAGE_TAG=sha-XXXXXX GHCR_IMAGE_PREFIX=ghcr.io/OWNER \
  bash /opt/vitrine/deploy/scripts/prune-docker-images.sh

# Uso de disco Docker
docker system df

# Backup Postgres (manual)
docker exec $(docker ps -q -f name=vitrine_postgres) \
  pg_dump -U vitrine vitrine > backup.sql
```

Diretórios na VPS:

- `/opt/vitrine/.env` — env gerado (600); valores entre aspas/escape bash — secrets podem conter espaços, `*`, cron, JSON
- `/opt/vitrine/traefik/traefik.yml` — config ativa
- `/opt/vitrine/stack/docker-stack.rendered.yml` — stack renderizado

## Migrar IP → domínio + HTTPS

1. DNS `A` → IP da VPS: **www**, **@** (apex), **api**, **admin**  
   Ex.: `PUBLIC_BASE_URL=https://www.seudominio.com.br` exige `api.seudominio.com.br` e `admin.seudominio.com.br`.
2. Atualizar secrets: `PUBLIC_BASE_URL=https://www.seudominio.com.br`, `TLS_ENABLED=true`, `ACME_EMAIL=...`
3. `ufw allow 443/tcp` na VPS
4. Redeploy (push ou workflow_dispatch) — **rebuild obrigatório** de `web` e `admin` (URLs baked no build)
5. Validar:
   - `https://www.seudominio.com.br/`
   - `https://api.seudominio.com.br/health/ready`
   - `https://admin.seudominio.com.br/login`

**www + apex + api + admin:** o deploy inclui todos no certificado Let's Encrypt (SAN) e redireciona apex → host de `PUBLIC_BASE_URL`. Sem registro DNS de **api** ou **admin**, o ACME falha e o browser verá `TRAEFIK DEFAULT CERT` nesses hosts.

**ACME:** o desafio HTTP do Let's Encrypt precisa responder em `http://dominio/.well-known/acme-challenge/` na porta **80**. O `traefik.https.yml` **não** usa redirect global no entrypoint `:80` (isso quebraria o challenge e o browser veria `TRAEFIK DEFAULT CERT`). Redirect HTTP→HTTPS é feito via router de baixa prioridade.

Se um deploy anterior emitiu certificado só para `www` e o apex ainda mostra certificado default, force nova emissão com SAN:

```bash
docker service scale vitrine_traefik=0
docker volume rm vitrine_traefik_letsencrypt   # nome pode variar: docker volume ls | grep letsencrypt
docker service scale vitrine_traefik=1
bash /opt/vitrine/deploy/scripts/deploy.sh   # ou redeploy via GitHub Actions
```

Paths **não mudam** — só scheme e host.

## Segurança operacional (bootstrap + render-env)

Hardening aplicado nos scripts de deploy para mitigar vazamento de segredos e bypass de firewall pelo Docker.

### O que foi mitigado

| Risco                                                                 | Script             | Mitigação                                                                           |
| --------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------- |
| Credenciais visíveis em `ps`/`/proc/*/cmdline` via `python3 -c '...'` | `render-env.sh`    | `urlencode()` em bash puro (sem subprocesso com argv)                               |
| Race condition: `.env` criado com umask default antes de `chmod 600`  | `render-env.sh`    | `mktemp` em `${APP_DIR}` + `umask 077` + `mv -f` atômico                            |
| UFW `deny incoming` contornado por portas publicadas no Docker        | `bootstrap-vps.sh` | Cadeia `DOCKER-USER` → `ufw-user-forward` (só 80/443 liberados)                     |
| Temp parcial em falha do render                                       | `render-env.sh`    | `trap EXIT` remove `.env.XXXXXX` e faz `unset` de segredos                          |
| `SITE_NAME` com barra invertida na UI (`Desk\ Setup`)                 | `brand.ts` + stack | `unescapeShellEnvValue`; `SITE_NAME` em runtime no serviço `web`                    |
| Migrate/seed com `NODE_ENV` = `"production"` (aspas literais)         | `migrate.sh` etc.  | `-e KEY` após `source` do `.env` via `docker-env-passthrough.sh` (não `--env-file`) |

**Nota:** o `.env` em `/opt/vitrine` usa `printf %q` para `source` bash seguro. Jobs one-shot (`migrate`, `seed`, `verify-operator-seed`) repassam variáveis com `docker run -e KEY` após o `source` — o `--env-file` do Docker não interpreta `%q` nem remove aspas duplas.

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

| Sintoma                                                          | Causa provável                                                                                                                                     | Ação                                                                                                                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 404 em `/` ou `/sobre` (texto `404 page not found`)              | Traefik sem rota ou TLS rejeitado (`Could not retrieve CanonizedHost`); serviço `web` sem task running                                             | `docker service ps vitrine_web`; logs `vitrine_traefik`; conferir DNS `api.`/`admin.`; redeploy com TLS por host (ver abaixo)                                        |
| 404 em `/` no smoke test                                         | Web ainda em cold start, Traefik sem rota, ou probe com `wget` (inexistente em alpine)                                                             | `HOSTNAME=0.0.0.0` no stack; probe via Node; logs `vitrine_web`                                                                                                      |
| 404 em `/admin`                                                  | `ADMIN_BASE_PATH` ausente no build admin                                                                                                           | Rebuild imagem admin com `/admin`                                                                                                                                    |
| Login admin: e-mail ou senha invalidos                           | Hash ok no DB mas API com `PASSWORD_PEPPER` corrompido no stack YAML                                                                               | Redeploy com escape YAML (`stack-env-escape.sh`); `run_seed: true`; smoke `smoke-api-login.sh` no pipeline                                                           |
| 404 em `/api/...`                                                | StripPrefix ou API down                                                                                                                            | `curl` interno + logs `vitrine_api`                                                                                                                                  |
| CORS no browser / `localhost:3000` no bloco de produtos          | Client components (`ProductGridBlock`, wishlist, etc.) chamavam API cross-origin com `NEXT_PUBLIC_API_URL` ausente no build                        | Web usa rewrite `/public-api/*` → API interna; rebuild/redeploy da imagem `web`                                                                                      |
| CORS no browser (legado)                                         | `CORS_ORIGINS` sem origem exata                                                                                                                    | Usar `PUBLIC_BASE_URL` sem path                                                                                                                                      |
| ACME falhou / `TRAEFIK DEFAULT CERT`                             | Redirect global HTTP→HTTPS na :80 (quebra HTTP challenge), DNS, :80 bloqueado, alias sem DNS                                                       | Usar `traefik.https.yml` com redirect via router; DNS **apex e www**; logs `vitrine_traefik`; renovar volume `traefik_letsencrypt` se cert antigo sem SAN            |
| `www` OK mas apex/api/admin com cert default                     | Certificado LE antigo sem SAN ou DNS ausente em subdomínios                                                                                        | Registros `A` para apex, `api`, `admin`; limpar `traefik_letsencrypt` e redeploy                                                                                     |
| Smoke test `HTTP 000` com HTTPS                                  | `curl` rejeita cert self-signed do Traefik (ACME ainda nao emitiu)                                                                                 | Corrigir ACME primeiro; apos LE valido, smoke passa sem `-k`                                                                                                         |
| UFW `UnicodeEncodeError`                                         | Comentários com acentos em `/etc/ufw/after.rules`                                                                                                  | Remover bloco `vitrine-docker`; reexecutar bootstrap atualizado (`LANG=C`)                                                                                           |
| `yaml: could not find expected ':'`                              | `envsubst` injeta URLs/`DATABASE_URL` sem aspas no stack                                                                                           | Template usa `"${VAR}"` em `deploy/docker-stack.yml`                                                                                                                 |
| `yaml: line 14: did not find expected key`                       | Indentacao duplicada em `TRAEFIK_HTTPS_PORT_BLOCK` com `TLS_ENABLED=true`                                                                          | Atualizar `deploy/scripts/deploy.sh` e redeploy                                                                                                                      |
| `not a swarm manager`                                            | `docker swarm init` nunca rodou (bootstrap interrompido)                                                                                           | Na VPS como root: `docker swarm init`; ou reexecutar `bootstrap-vps.sh`                                                                                              |
| OOM 4 GB / exit **137** no `vitrine_web` ou `vitrine_admin`      | Limite 384M insuficiente para cold start Next.js                                                                                                   | Stack usa **640M** + `NODE_OPTIONS=--max-old-space-size=460`; redeploy; `docker service ps vitrine_web`                                                              |
| OOM 4 GB (geral)                                                 | Soma dos limites de memória no VPS 4 GB                                                                                                            | Reduzir `TELEMETRY_BUFFER_MAX_LEN` ou limites de `worker`/`api`                                                                                                      |
| Migrate falhou                                                   | Postgres não pronto                                                                                                                                | `wait-postgres.sh`; ver rede `vitrine_vitrine_net`                                                                                                                   |
| Home sem CMS publicado                                           | `GET /pages/home` → 404                                                                                                                            | Web exibe `EmptySiteFallback` na `/` (200); rodar bootstrap seed ou publicar no admin                                                                                |
| API indisponível / 5xx na home ou `/?_rsc=`                      | SSR do `web` chamava `NEXT_PUBLIC_API_URL` (hairpin → `UND_ERR_CONNECT_TIMEOUT`) → healthcheck falhava → task shutdown                             | Redeploy com `resolveApiBaseUrl()` + `API_INTERNAL_URL` no `web`; `smoke-web-internal-api.sh`; logs nao devem citar `api.*:443`                                      |
| API indisponível / 5xx na home (legado)                          | Erro real de infra na overlay                                                                                                                      | HTTP 500 — investigar logs `vitrine_api` / rede overlay                                                                                                              |
| `Public web revalidation request failed` + `fetch failed`        | Serviço `web` indisponível na overlay (`ECONNREFUSED`, OOM exit 137, restart) — **não** é secret errado (isso seria HTTP 401)                      | `docker service ps vitrine_web`; logs `vitrine_web`; `smoke-revalidate.sh`; API faz retry automático (4 tentativas)                                                  |
| `Public web revalidation request failed`                         | Rede overlay API→web ou `WEB_INTERNAL_URL` errado                                                                                                  | `bash /opt/vitrine/deploy/scripts/smoke-revalidate.sh`; conferir `WEB_INTERNAL_URL=http://web:3001`                                                                  |
| `Public web revalidation failed` status 401                      | `REVALIDATE_SECRET` diferente entre `api` e `web`, ou secret com quebra de linha                                                                   | Regenerar secret (uma linha); redeploy; `render-env.sh` normaliza `\n` em secrets                                                                                    |
| API em restart loop / `EHOSTUNREACH` Redis / 503 `/health/ready` | Healthcheck antigo usava `wget` (ausente no Alpine) + `/health/ready` (Postgres); overlay instável após restart do Redis; `REDIS_URL` com IP stale | Stack/API usam `/health` (liveness); ioredis reconecta via hostname `redis`; `ResilientCacheStore` degrada cache; imagens `/uploads/` usam `<img>` sem `_next/image` |
| Migrate `EHOSTUNREACH 10.0.x.x:5432`                             | `docker run` na overlay falha roteamento ao VIP Postgres; `wait-postgres` usa `docker exec` e passa                                                | `migrate.sh`/`seed.sh` usam `--network container:<postgres_task>` + `127.0.0.1`; redeploy scripts                                                                    |
| `_next/image` / `isn't a valid image` em `/uploads/...`          | API indisponível durante otimização Next.js de uploads proxied                                                                                     | `RemoteImage` usa `<img>` para `/uploads/`; redeploy `web`                                                                                                           |
| Redis `AOF fsync taking too long` / SIGTERM                      | Disco VPS lento durante BGSAVE; Swarm substitui task                                                                                               | Stack usa `--no-appendfsync-on-rewrite`; monitorar `df -h`                                                                                                           |
| `SITE_NAME` errado no banco (`Desk\ Setup`)                      | Seed anterior com escape bash no secret                                                                                                            | Corrigir secret `SITE_NAME=Desk Setup`; rodar seed (secao abaixo)                                                                                                    |
| Disco VPS cheio (`no space left`)                                | Tags `sha-*` acumuladas de cada deploy                                                                                                             | `prune-docker-images.sh` roda ao fim do deploy; limpeza manual na secao Operacao                                                                                     |

## Limpeza de imagens Docker

Ao final de cada deploy bem-sucedido, `deploy/scripts/prune-docker-images.sh`:

1. Remove tags antigas de `vitrine-{api,worker,web,admin,migrate}` (ex.: `sha-abc1234` de deploys anteriores).
2. **Preserva** a tag do deploy atual (`IMAGE_TAG`), `latest` e imagens ainda referenciadas por tasks Swarm (rollback recente).
3. Executa `docker image prune -f` para camadas dangling.

Variáveis opcionais (export antes do deploy ou no SSH do GitHub Actions):

| Variável                       | Default  | Descrição                                       |
| ------------------------------ | -------- | ----------------------------------------------- |
| `DOCKER_IMAGE_PRUNE_ENABLED`   | `true`   | `false` desliga a limpeza                       |
| `DOCKER_IMAGE_PRUNE_KEEP_TAGS` | `latest` | Tags extras a manter (CSV), além de `IMAGE_TAG` |

A limpeza **não** remove imagens de infra (`postgres`, `redis`, `traefik`) nem volumes de dados.

## Object storage (S3)

Uploads de avatar e demais arquivos gerenciados pela API usam `STORAGE_DRIVER` (`filesystem` | `s3` | `gcs`). No Swarm, o driver afeta os serviços **`api`** e **`worker`** (volume `uploads_data` só é usado com `filesystem`).

### Ativar S3 em produção

1. Criar bucket S3 (região ex.: `sa-east-1`) com policy de leitura pública nos objetos de upload **ou** CloudFront na frente.
2. Criar usuário IAM com permissão mínima (`s3:PutObject`, `s3:DeleteObject`, `s3:GetObject` no prefixo de uploads).
3. No GitHub → **Settings → Environments → production**, adicionar secrets:
   - `STORAGE_DRIVER` = `s3`
   - `AWS_S3_BUCKET`, `AWS_S3_REGION`
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - (opcional) `STORAGE_PUBLIC_BASE_URL` = URL CloudFront ou bucket público
4. Redeploy via **Deploy Production** — o workflow repassa os secrets para `render-env.sh`, que grava `/opt/vitrine/.env` e o stack injeta as variáveis nos containers.

**Não basta** colocar chaves só no secret sem redeploy: o `.env` da VPS e o stack YAML são regenerados a cada deploy. Valores vazios mantêm `filesystem` + `{API_PUBLIC_URL}/uploads`.

Detalhes de drivers locais: [admin-profile-phase1.md](./admin-profile-phase1.md).

## Re-seed e correção de brand no banco

O bootstrap seed de produção (`SEED_FORCE=true`) é idempotente: não duplica produtos demo, mas **atualiza** conteúdo editorial derivado de `SITE_NAME` / `SITE_TAGLINE`:

- Home CMS (`pages.slug=home`): título, `seoTitle`, slide do hero
- Página Sobre (`institutionalContent`)
- Operador seed: nome e senha (`ADMIN_SEED_*`)

Na VPS (após corrigir `SITE_NAME` no secret GitHub e redeploy do `.env`):

```bash
bash /opt/vitrine/deploy/scripts/seed.sh
```

Ou via GitHub Actions: workflow **Deploy Production** → `run_seed: true`.

Confirme que `SITE_NAME` no secret é `Desk Setup` **sem** barra invertida — o seed usa `getBrandConfig()` que normaliza escapes bash.

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
