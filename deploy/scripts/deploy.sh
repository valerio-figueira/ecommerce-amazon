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

# shellcheck source=deploy/scripts/tls-hosts.sh
source "${SCRIPT_DIR}/tls-hosts.sh"

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

resolve_public_hosts_from_base_url "${PUBLIC_BASE_URL}"
resolve_tls_hosts_from_public_host "${WEB_CANONICAL_HOST}"
build_tls_sans_csv "${WEB_CANONICAL_HOST}"

if [[ "${TLS_ENABLED}" == "true" ]]; then
  : "${ACME_EMAIL:?ACME_EMAIL is required when TLS_ENABLED=true}"
  export TRAEFIK_ENTRYPOINT=websecure
  export TRAEFIK_API_TLS_LABELS="$(build_traefik_service_tls_labels vitrine-api)"
  export TRAEFIK_WEB_TLS_LABELS="$(build_traefik_service_tls_labels vitrine-web)"
  export TRAEFIK_ADMIN_TLS_LABELS="$(build_traefik_service_tls_labels vitrine-admin)"
  export TRAEFIK_HTTPS_PORT_BLOCK=$'- target: 443\n        published: 443\n        protocol: tcp\n        mode: host'
  export TRAEFIK_TLS_MAIN="${WEB_CANONICAL_HOST}"
  export TRAEFIK_CANONICAL_HOST="${WEB_CANONICAL_HOST}"
  export TRAEFIK_REDIRECT_FROM_HOST="${TLS_REDIRECT_FROM_HOST}"
  export TRAEFIK_REDIRECT_FROM_HOST_REGEX="$(escape_domain_regex "${TLS_REDIRECT_FROM_HOST}")"
  build_traefik_tls_sans_yaml "${TLS_SANS_CSV}"
  export TRAEFIK_TLS_SANS_YAML
  export ACME_EMAIL
  echo "    TLS: main=${WEB_CANONICAL_HOST} sans=${TLS_SANS_CSV:-<none>}"
  envsubst '${ACME_EMAIL} ${TRAEFIK_DOCKER_NETWORK} ${TRAEFIK_TLS_MAIN} ${TRAEFIK_TLS_SANS_YAML} ${TRAEFIK_REDIRECT_FROM_HOST} ${TRAEFIK_REDIRECT_FROM_HOST_REGEX} ${TRAEFIK_CANONICAL_HOST}' \
    <"${REPO_DEPLOY_DIR}/traefik/traefik.https.yml" >"${APP_DIR}/traefik/traefik.yml"
else
  export TRAEFIK_ENTRYPOINT=web
  export TRAEFIK_API_TLS_LABELS=""
  export TRAEFIK_WEB_TLS_LABELS=""
  export TRAEFIK_ADMIN_TLS_LABELS=""
  export TRAEFIK_HTTPS_PORT_BLOCK=""
  envsubst '${TRAEFIK_DOCKER_NETWORK}' <"${REPO_DEPLOY_DIR}/traefik/traefik.http.yml" >"${APP_DIR}/traefik/traefik.yml"
fi

export TRAEFIK_API_ROUTER_LABELS="$(build_traefik_api_router_labels "${TRAEFIK_ENTRYPOINT}")"
export TRAEFIK_WEB_ROUTER_LABELS="$(build_traefik_web_router_labels "${TRAEFIK_ENTRYPOINT}")"
export TRAEFIK_ADMIN_ROUTER_LABELS="$(build_traefik_admin_router_labels "${TRAEFIK_ENTRYPOINT}")"
echo "    Routing (${DEPLOY_ROUTING_MODE}): web=${PUBLIC_BASE_URL} api=${API_PUBLIC_URL} admin=${ADMIN_PUBLIC_URL}"

echo "==> Renderizando stack Swarm"
mkdir -p "${APP_DIR}/stack"
# shellcheck source=deploy/scripts/stack-env-escape.sh
source "${SCRIPT_DIR}/stack-env-escape.sh"
export_stack_yaml_secrets
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

echo "==> Bootstrap CMS / seed (se necessario)"
export RUN_SEED="${RUN_SEED:-false}"
bash "${SCRIPT_DIR}/ensure-bootstrap-seed.sh"

echo "==> Aguardando API e smoke test de login"
bash "${SCRIPT_DIR}/wait-service-http.sh" api /health/ready 3000
bash "${SCRIPT_DIR}/smoke-api-login.sh"

echo "==> Aguardando tasks Swarm (web, api, admin)"
bash "${SCRIPT_DIR}/wait-swarm-service.sh" web
bash "${SCRIPT_DIR}/wait-swarm-service.sh" api
bash "${SCRIPT_DIR}/wait-swarm-service.sh" admin

echo "==> Aguardando apps no stack (cold start Next.js)"
ADMIN_PROBE_PATH="/login"
if [[ "${DEPLOY_ROUTING_MODE}" == "path" ]]; then
  ADMIN_PROBE_PATH="/admin/login"
fi
bash "${SCRIPT_DIR}/wait-service-http.sh" web /api/health 3001
bash "${SCRIPT_DIR}/wait-service-http.sh" admin "${ADMIN_PROBE_PATH}" 3002

echo "==> Smoke: web container → API overlay + SSR home"
bash "${SCRIPT_DIR}/smoke-web-internal-api.sh"

echo "==> Smoke tests (web=${PUBLIC_BASE_URL}, api=${API_PUBLIC_URL}, admin=${ADMIN_PUBLIC_URL})"
bash "${SCRIPT_DIR}/wait-http-url.sh" "${API_PUBLIC_URL}/health/ready" 200
echo "    API /health/ready OK"

bash "${SCRIPT_DIR}/wait-http-url.sh" "${PUBLIC_BASE_URL}/" "200,304"
echo "    Web / OK"

bash "${SCRIPT_DIR}/wait-http-url.sh" "${PUBLIC_BASE_URL}/sobre" "200,304"
echo "    Web /sobre OK"

bash "${SCRIPT_DIR}/wait-http-url.sh" "${ADMIN_PUBLIC_URL}/login" "200,304"
echo "    Admin /login OK"

bash "${SCRIPT_DIR}/prune-docker-images.sh"

echo "==> Deploy concluído com sucesso"
