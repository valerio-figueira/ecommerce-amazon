#!/usr/bin/env bash
# Executa migrations Drizzle em container one-shot na rede overlay do Swarm.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-/opt/vitrine}"
STACK_NAME="${STACK_NAME:-vitrine}"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
GHCR_IMAGE_PREFIX="${GHCR_IMAGE_PREFIX:?GHCR_IMAGE_PREFIX is required}"
NETWORK="${STACK_NAME}_vitrine_net"
MIGRATE_IMAGE="${GHCR_IMAGE_PREFIX}/vitrine-migrate:${IMAGE_TAG}"

# shellcheck source=deploy/scripts/docker-env-passthrough.sh
source "${SCRIPT_DIR}/docker-env-passthrough.sh"
# shellcheck source=deploy/scripts/swarm-overlay-env.sh
source "${SCRIPT_DIR}/swarm-overlay-env.sh"

# shellcheck source=/dev/null
set -a
source "${APP_DIR}/.env"
set +a

apply_swarm_overlay_urls

docker_env_args=()
collect_docker_env_passthrough_args "${APP_DIR}/.env" docker_env_args

echo "==> Rodando migrations (${MIGRATE_IMAGE})"
docker pull "${MIGRATE_IMAGE}"

docker run --rm \
  --network "${NETWORK}" \
  "${docker_env_args[@]}" \
  "${MIGRATE_IMAGE}"

echo "==> Migrations concluídas"
