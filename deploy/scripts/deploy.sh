#!/usr/bin/env bash
# Deploy principal: Traefik config → render stack → stack deploy → migrate → smoke tests.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DEPLOY_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

APP_DIR="${APP_DIR:-/opt/vitrine}"
STACK_NAME="${STACK_NAME:-vitrine}"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
GHCR_IMAGE_PREFIX="${GHCR_IMAGE_PREFIX:?GHCR_IMAGE_PREFIX is required}"
STACK_TEMPLATE="${REPO_DEPLOY_DIR}/docker-stack.yml"
RENDERED_STACK="${APP_DIR}/stack/docker-stack.rendered.yml"

# shellcheck source=/dev/null
set -a
source "${APP_DIR}/.env"
set +a

TLS_ENABLED="${TLS_ENABLED:-false}"
TRAEFIK_DOCKER_NETWORK="${STACK_NAME}_vitrine_net"
export TRAEFIK_DOCKER_NETWORK
export GHCR_IMAGE_PREFIX
export IMAGE_TAG

echo "==> Selecionando config Traefik (TLS_ENABLED=${TLS_ENABLED})"
mkdir -p "${APP_DIR}/traefik"
if [[ "${TLS_ENABLED}" == "true" ]]; then
  : "${ACME_EMAIL:?ACME_EMAIL is required when TLS_ENABLED=true}"
  export TRAEFIK_ENTRYPOINT=websecure
  export TRAEFIK_API_TLS_LABELS=$'- traefik.http.routers.vitrine-api.tls=true\n        - traefik.http.routers.vitrine-api.tls.certresolver=letsencrypt'
  export TRAEFIK_WEB_TLS_LABELS=$'- traefik.http.routers.vitrine-web.tls=true\n        - traefik.http.routers.vitrine-web.tls.certresolver=letsencrypt'
  export TRAEFIK_ADMIN_TLS_LABELS=$'- traefik.http.routers.vitrine-admin.tls=true\n        - traefik.http.routers.vitrine-admin.tls.certresolver=letsencrypt'
  export TRAEFIK_HTTPS_PORT_BLOCK=$'      - target: 443\n        published: 443\n        protocol: tcp\n        mode: host'
  envsubst <"${REPO_DEPLOY_DIR}/traefik/traefik.https.yml" >"${APP_DIR}/traefik/traefik.yml"
else
  export TRAEFIK_ENTRYPOINT=web
  export TRAEFIK_API_TLS_LABELS=""
  export TRAEFIK_WEB_TLS_LABELS=""
  export TRAEFIK_ADMIN_TLS_LABELS=""
  export TRAEFIK_HTTPS_PORT_BLOCK=""
  envsubst <"${REPO_DEPLOY_DIR}/traefik/traefik.http.yml" >"${APP_DIR}/traefik/traefik.yml"
fi

echo "==> Renderizando stack Swarm"
mkdir -p "${APP_DIR}/stack"
envsubst <"${STACK_TEMPLATE}" >"${RENDERED_STACK}"

echo "==> Pull das imagens da aplicação"
for app in api worker web admin; do
  docker pull "${GHCR_IMAGE_PREFIX}/vitrine-${app}:${IMAGE_TAG}"
done

echo "==> docker stack deploy (${STACK_NAME})"
docker stack deploy --with-registry-auth --resolve-image always -c "${RENDERED_STACK}" "${STACK_NAME}"

echo "==> Aguardando Postgres"
bash "${SCRIPT_DIR}/wait-postgres.sh"

echo "==> Migrations"
bash "${SCRIPT_DIR}/migrate.sh"

echo "==> Smoke tests em ${PUBLIC_BASE_URL}"
curl -fsS "${PUBLIC_BASE_URL}/api/health/ready" >/dev/null
echo "    /api/health/ready OK"

WEB_CODE="$(curl -fsS -o /dev/null -w '%{http_code}' "${PUBLIC_BASE_URL}/")"
if [[ "${WEB_CODE}" != "200" && "${WEB_CODE}" != "304" ]]; then
  echo "ERRO: vitrine retornou HTTP ${WEB_CODE}" >&2
  exit 1
fi
echo "    / OK (HTTP ${WEB_CODE})"

ADMIN_CODE="$(curl -fsS -o /dev/null -w '%{http_code}' "${PUBLIC_BASE_URL}/admin/login")"
if [[ "${ADMIN_CODE}" != "200" && "${ADMIN_CODE}" != "304" ]]; then
  echo "ERRO: admin retornou HTTP ${ADMIN_CODE}" >&2
  exit 1
fi
echo "    /admin/login OK (HTTP ${ADMIN_CODE})"

echo "==> Deploy concluído com sucesso"
