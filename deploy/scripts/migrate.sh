#!/usr/bin/env bash
# Executa migrations Drizzle em container one-shot na rede do task Postgres (sidecar).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-/opt/vitrine}"
STACK_NAME="${STACK_NAME:-vitrine}"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
GHCR_IMAGE_PREFIX="${GHCR_IMAGE_PREFIX:?GHCR_IMAGE_PREFIX is required}"
MIGRATE_IMAGE="${GHCR_IMAGE_PREFIX}/vitrine-migrate:${IMAGE_TAG}"

# shellcheck source=deploy/scripts/docker-env-passthrough.sh
source "${SCRIPT_DIR}/docker-env-passthrough.sh"
# shellcheck source=deploy/scripts/swarm-overlay-env.sh
source "${SCRIPT_DIR}/swarm-overlay-env.sh"
# shellcheck source=deploy/scripts/swarm-task-container.sh
source "${SCRIPT_DIR}/swarm-task-container.sh"

# shellcheck source=/dev/null
set -a
source "${APP_DIR}/.env"
set +a

POSTGRES_CID="$(resolve_running_task_container_id postgres)" || {
  echo "ERRO: container do serviço ${STACK_NAME}_postgres não encontrado" >&2
  exit 1
}

apply_postgres_sidecar_database_url

echo "==> Rodando migrations (${MIGRATE_IMAGE}) via network namespace do Postgres (${POSTGRES_CID:0:12})"
docker pull "${MIGRATE_IMAGE}"

docker run --rm \
  --network "container:${POSTGRES_CID}" \
  -e NODE_ENV=production \
  -e "DATABASE_URL=${DATABASE_URL}" \
  -e "POSTGRES_USER=${POSTGRES_USER}" \
  -e "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}" \
  -e "POSTGRES_DB=${POSTGRES_DB}" \
  "${MIGRATE_IMAGE}"

echo "==> Migrations concluídas"
