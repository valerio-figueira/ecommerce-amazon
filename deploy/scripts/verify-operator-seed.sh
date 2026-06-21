#!/usr/bin/env bash
# Verifica se o operador seed no Postgres confere com ADMIN_SEED_* + PASSWORD_PEPPER.
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

: "${PASSWORD_PEPPER:?PASSWORD_PEPPER is required}"
: "${ADMIN_SEED_EMAIL:?ADMIN_SEED_EMAIL is required}"
: "${ADMIN_SEED_PASSWORD:?ADMIN_SEED_PASSWORD is required}"

docker run --rm \
  --network "${NETWORK}" \
  --env-file "${APP_DIR}/.env" \
  -e POSTGRES_HOST=postgres \
  -e NODE_ENV=production \
  -e "PASSWORD_PEPPER=${PASSWORD_PEPPER}" \
  -e "ADMIN_SEED_EMAIL=${ADMIN_SEED_EMAIL}" \
  -e "ADMIN_SEED_PASSWORD=${ADMIN_SEED_PASSWORD}" \
  "${MIGRATE_IMAGE}" \
  npm run db:verify-operator-seed -w @ecommerce-amazon/infrastructure
