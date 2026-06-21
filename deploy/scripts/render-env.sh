#!/usr/bin/env bash
# Monta /opt/vitrine/.env a partir de variáveis exportadas (CI injeta via SSH).
# PUBLIC_BASE_URL é o único ponto de verdade para URLs públicas.
#
# Mitigações de segurança:
# - V1: urlencode em bash puro (sem argv leak via python3 -c em ps/proc).
# - V3: mktemp em APP_DIR + umask 077 + mv atômico (sem race de permissões no .env).
# - Cleanup: trap EXIT remove temp parcial e unset de segredos em memória do shell.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=deploy/scripts/tls-hosts.sh
source "${SCRIPT_DIR}/tls-hosts.sh"

APP_DIR="${APP_DIR:-/opt/vitrine}"
ENV_FILE="${APP_DIR}/.env"
tmp_env=""

# Escape value for safe `source` of the generated .env (spaces, *, cron, JSON, etc.).
env_quote() {
  printf '%q' "$1"
}

# RFC 3986 percent-encoding — evita subprocesso com credenciais na argv (V1).
urlencode() {
  local raw="$1" i c
  for ((i = 0; i < ${#raw}; i++)); do
    c="${raw:i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) printf '%s' "$c" ;;
      *) printf '%%%.2X' "'$c" ;;
    esac
  done
}

cleanup() {
  if [[ -n "${tmp_env}" && -f "${tmp_env}" ]]; then
    rm -f "${tmp_env}"
  fi
  unset POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB DATABASE_URL \
    JWT_SECRET PASSWORD_PEPPER ENCRYPTION_KEY REVALIDATE_SECRET \
    RESEND_API_KEY GA4_SERVICE_ACCOUNT_JSON GHCR_PULL_TOKEN \
    ADMIN_SEED_EMAIL ADMIN_SEED_PASSWORD 2>/dev/null || true
}

trap cleanup EXIT

: "${PUBLIC_BASE_URL:?PUBLIC_BASE_URL is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${JWT_SECRET:?JWT_SECRET is required}"
: "${PASSWORD_PEPPER:?PASSWORD_PEPPER is required}"
: "${ENCRYPTION_KEY:?ENCRYPTION_KEY is required}"

# Remove trailing slash — URLs derivadas são montadas de forma consistente.
PUBLIC_BASE_URL="${PUBLIC_BASE_URL%/}"

export NODE_ENV="${NODE_ENV:-production}"
export TLS_ENABLED="${TLS_ENABLED:-false}"

# URLs públicas derivadas (path routing: /api, /admin).
export NEXT_PUBLIC_API_URL="${PUBLIC_BASE_URL}/api"
export NEXT_PUBLIC_SITE_URL="${PUBLIC_BASE_URL}"
export WEB_PUBLIC_URL="${PUBLIC_BASE_URL}"
export STORAGE_PUBLIC_BASE_URL="${PUBLIC_BASE_URL}/api/uploads"
export CORS_ORIGINS="${CORS_ORIGINS:-${PUBLIC_BASE_URL}}"
if alt_origin="$(derive_alt_public_origin "${PUBLIC_BASE_URL}")"; then
  if [[ ",${CORS_ORIGINS}," != *",${alt_origin},"* ]]; then
    export CORS_ORIGINS="${CORS_ORIGINS},${alt_origin}"
  fi
fi
export API_INTERNAL_URL="${API_INTERNAL_URL:-http://api:3000}"

# Docker Swarm service hostnames (overlay network).
export POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export REDIS_HOST="${REDIS_HOST:-redis}"
export REDIS_PORT="${REDIS_PORT:-6379}"
export REDIS_CACHE_DB="${REDIS_CACHE_DB:-0}"
export REDIS_QUEUE_DB="${REDIS_QUEUE_DB:-1}"
export REDIS_TELEMETRY_DB="${REDIS_TELEMETRY_DB:-2}"

POSTGRES_USER_ENC="$(urlencode "${POSTGRES_USER}")"
POSTGRES_PASSWORD_ENC="$(urlencode "${POSTGRES_PASSWORD}")"
export DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER_ENC}:${POSTGRES_PASSWORD_ENC}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}}"
export REDIS_URL="${REDIS_URL:-redis://${REDIS_HOST}:${REDIS_PORT}}"

export API_PORT="${API_PORT:-3000}"
export WEB_PORT="${WEB_PORT:-3001}"
export ADMIN_PORT="${ADMIN_PORT:-3002}"
export STORAGE_DRIVER="${STORAGE_DRIVER:-filesystem}"
export STORAGE_LOCAL_ROOT="${STORAGE_LOCAL_ROOT:-/app/uploads}"
export SEED_FORCE="${SEED_FORCE:-false}"
export TELEMETRY_BUFFER_ENABLED="${TELEMETRY_BUFFER_ENABLED:-true}"
export TELEMETRY_FLUSH_BATCH_SIZE="${TELEMETRY_FLUSH_BATCH_SIZE:-5000}"
export TELEMETRY_FLUSH_CRON="${TELEMETRY_FLUSH_CRON:-*/5 * * * *}"
export TELEMETRY_BUFFER_MAX_LEN="${TELEMETRY_BUFFER_MAX_LEN:-100000}"

export JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-8h}"
export REVALIDATE_SECRET="${REVALIDATE_SECRET:-}"
export SITE_NAME="${SITE_NAME:-Vitrine}"
export COMPANY_LEGAL_NAME="${COMPANY_LEGAL_NAME:-Vitrine Ltda}"
export CONTACT_EMAIL="${CONTACT_EMAIL:-contato@vitrine.com.br}"
export SITE_TAGLINE="${SITE_TAGLINE:-Curadoria inteligente}"
export AMAZON_AFFILIATE_TAG="${AMAZON_AFFILIATE_TAG:-}"
export SHOPEE_AFFILIATE_ID="${SHOPEE_AFFILIATE_ID:-}"
export EMAIL_FROM="${EMAIL_FROM:-noreply@example.com}"
export RESEND_API_KEY="${RESEND_API_KEY:-}"
export GA4_PROPERTY_ID="${GA4_PROPERTY_ID:-}"
export GA4_SERVICE_ACCOUNT_JSON="${GA4_SERVICE_ACCOUNT_JSON:-}"
export ACME_EMAIL="${ACME_EMAIL:-}"
export ADMIN_SEED_EMAIL="${ADMIN_SEED_EMAIL:-}"
export ADMIN_SEED_PASSWORD="${ADMIN_SEED_PASSWORD:-}"

if [[ ! -d "${APP_DIR}" ]]; then
  mkdir -p "${APP_DIR}"
fi
if [[ ! -w "${APP_DIR}" ]]; then
  echo "ERRO: ${APP_DIR} não é gravável" >&2
  exit 1
fi

# V3: temp no mesmo filesystem que .env — mv -f só é atômico no mesmo mount (nunca /tmp).
tmp_env="$(mktemp "${APP_DIR}/.env.XXXXXX")"
chmod 600 "${tmp_env}"

(
  umask 077
  cat >"${tmp_env}" <<EOF
# Gerado por render-env.sh — não editar manualmente no VPS.
NODE_ENV=$(env_quote "${NODE_ENV}")
TLS_ENABLED=$(env_quote "${TLS_ENABLED}")
PUBLIC_BASE_URL=$(env_quote "${PUBLIC_BASE_URL}")
NEXT_PUBLIC_API_URL=$(env_quote "${NEXT_PUBLIC_API_URL}")
NEXT_PUBLIC_SITE_URL=$(env_quote "${NEXT_PUBLIC_SITE_URL}")
WEB_PUBLIC_URL=$(env_quote "${WEB_PUBLIC_URL}")
API_INTERNAL_URL=$(env_quote "${API_INTERNAL_URL}")
STORAGE_PUBLIC_BASE_URL=$(env_quote "${STORAGE_PUBLIC_BASE_URL}")
CORS_ORIGINS=$(env_quote "${CORS_ORIGINS}")
POSTGRES_HOST=$(env_quote "${POSTGRES_HOST}")
POSTGRES_PORT=$(env_quote "${POSTGRES_PORT}")
POSTGRES_USER=$(env_quote "${POSTGRES_USER}")
POSTGRES_PASSWORD=$(env_quote "${POSTGRES_PASSWORD}")
POSTGRES_DB=$(env_quote "${POSTGRES_DB}")
DATABASE_URL=$(env_quote "${DATABASE_URL}")
REDIS_HOST=$(env_quote "${REDIS_HOST}")
REDIS_PORT=$(env_quote "${REDIS_PORT}")
REDIS_URL=$(env_quote "${REDIS_URL}")
REDIS_CACHE_DB=$(env_quote "${REDIS_CACHE_DB}")
REDIS_QUEUE_DB=$(env_quote "${REDIS_QUEUE_DB}")
REDIS_TELEMETRY_DB=$(env_quote "${REDIS_TELEMETRY_DB}")
API_PORT=$(env_quote "${API_PORT}")
WEB_PORT=$(env_quote "${WEB_PORT}")
ADMIN_PORT=$(env_quote "${ADMIN_PORT}")
JWT_SECRET=$(env_quote "${JWT_SECRET}")
JWT_EXPIRES_IN=$(env_quote "${JWT_EXPIRES_IN}")
PASSWORD_PEPPER=$(env_quote "${PASSWORD_PEPPER}")
ENCRYPTION_KEY=$(env_quote "${ENCRYPTION_KEY}")
REVALIDATE_SECRET=$(env_quote "${REVALIDATE_SECRET}")
SITE_NAME=$(env_quote "${SITE_NAME}")
COMPANY_LEGAL_NAME=$(env_quote "${COMPANY_LEGAL_NAME}")
CONTACT_EMAIL=$(env_quote "${CONTACT_EMAIL}")
SITE_TAGLINE=$(env_quote "${SITE_TAGLINE}")
AMAZON_AFFILIATE_TAG=$(env_quote "${AMAZON_AFFILIATE_TAG}")
SHOPEE_AFFILIATE_ID=$(env_quote "${SHOPEE_AFFILIATE_ID}")
EMAIL_FROM=$(env_quote "${EMAIL_FROM}")
RESEND_API_KEY=$(env_quote "${RESEND_API_KEY}")
STORAGE_DRIVER=$(env_quote "${STORAGE_DRIVER}")
STORAGE_LOCAL_ROOT=$(env_quote "${STORAGE_LOCAL_ROOT}")
SEED_FORCE=$(env_quote "${SEED_FORCE}")
TELEMETRY_BUFFER_ENABLED=$(env_quote "${TELEMETRY_BUFFER_ENABLED}")
TELEMETRY_FLUSH_BATCH_SIZE=$(env_quote "${TELEMETRY_FLUSH_BATCH_SIZE}")
TELEMETRY_FLUSH_CRON=$(env_quote "${TELEMETRY_FLUSH_CRON}")
TELEMETRY_BUFFER_MAX_LEN=$(env_quote "${TELEMETRY_BUFFER_MAX_LEN}")
GA4_PROPERTY_ID=$(env_quote "${GA4_PROPERTY_ID}")
GA4_SERVICE_ACCOUNT_JSON=$(env_quote "${GA4_SERVICE_ACCOUNT_JSON}")
ACME_EMAIL=$(env_quote "${ACME_EMAIL}")
ADMIN_SEED_EMAIL=$(env_quote "${ADMIN_SEED_EMAIL}")
ADMIN_SEED_PASSWORD=$(env_quote "${ADMIN_SEED_PASSWORD}")
EOF
)

mv -f "${tmp_env}" "${ENV_FILE}"
tmp_env=""
chmod 600 "${ENV_FILE}"

echo "Wrote ${ENV_FILE}"
