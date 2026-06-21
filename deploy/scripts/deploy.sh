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

ensure_swarm_manager() {
  local state control
  state="$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null || echo inactive)"
  control="$(docker info --format '{{.Swarm.ControlAvailable}}' 2>/dev/null || echo false)"
  if [[ "${state}" != "active" || "${control}" != "true" ]]; then
    echo "ERRO: Docker Swarm nao esta ativo neste no (state=${state}, manager=${control})." >&2
    echo "       Na VPS como root: docker swarm init" >&2
    echo "       Ou: bash ${REPO_DEPLOY_DIR}/scripts/bootstrap-vps.sh" >&2
    exit 1
  fi
}

echo "==> Verificando Docker Swarm"
ensure_swarm_manager

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

echo "==> Aguardando apps no stack (cold start Next.js)"
bash "${SCRIPT_DIR}/wait-service-http.sh" web / 3001
bash "${SCRIPT_DIR}/wait-service-http.sh" admin /admin/login 3002

echo "==> Smoke tests em ${PUBLIC_BASE_URL}"
bash "${SCRIPT_DIR}/wait-http-url.sh" "${PUBLIC_BASE_URL}/api/health/ready" 200
echo "    /api/health/ready OK"

bash "${SCRIPT_DIR}/wait-http-url.sh" "${PUBLIC_BASE_URL}/" "200,304"
echo "    / OK"

bash "${SCRIPT_DIR}/wait-http-url.sh" "${PUBLIC_BASE_URL}/admin/login" "200,304"
echo "    /admin/login OK"

echo "==> Deploy concluído com sucesso"
