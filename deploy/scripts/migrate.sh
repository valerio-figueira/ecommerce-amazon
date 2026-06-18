#!/usr/bin/env bash
# Executa migrations Drizzle em container one-shot na rede overlay do Swarm.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/vitrine}"
STACK_NAME="${STACK_NAME:-vitrine}"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
GHCR_IMAGE_PREFIX="${GHCR_IMAGE_PREFIX:?GHCR_IMAGE_PREFIX is required}"
NETWORK="${STACK_NAME}_vitrine_net"
MIGRATE_IMAGE="${GHCR_IMAGE_PREFIX}/vitrine-migrate:${IMAGE_TAG}"

# shellcheck source=/dev/null
set -a
source "${APP_DIR}/.env"
set +a

echo "==> Rodando migrations (${MIGRATE_IMAGE})"
docker pull "${MIGRATE_IMAGE}"

docker run --rm \
  --network "${NETWORK}" \
  --env-file "${APP_DIR}/.env" \
  -e POSTGRES_HOST=postgres \
  -e REDIS_HOST=redis \
  "${MIGRATE_IMAGE}"

echo "==> Migrations concluídas"
