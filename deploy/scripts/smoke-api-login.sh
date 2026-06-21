#!/usr/bin/env bash
# Smoke test: POST /admin/auth/login na API (overlay) com ADMIN_SEED_* do .env.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/vitrine}"
STACK_NAME="${STACK_NAME:-vitrine}"
NETWORK="${STACK_NAME}_vitrine_net"

# shellcheck source=/dev/null
set -a
source "${APP_DIR}/.env"
set +a

: "${ADMIN_SEED_EMAIL:?ADMIN_SEED_EMAIL is required}"
: "${ADMIN_SEED_PASSWORD:?ADMIN_SEED_PASSWORD is required}"
: "${PASSWORD_PEPPER:?PASSWORD_PEPPER is required}"

trim_trailing_ws() {
  local value="$1"
  printf '%s' "${value%"${value##*[![:space:]]}"}"
}

json_escape_string() {
  local value="$1" escaped="" char
  local i
  for ((i = 0; i < ${#value}; i++)); do
    char="${value:i:1}"
    case "$char" in
      '"') escaped+='\"' ;;
      \\) escaped+='\\' ;;
      $'\n') escaped+='\n' ;;
      $'\r') escaped+='\r' ;;
      $'\t') escaped+='\t' ;;
      *) escaped+="$char" ;;
    esac
  done
  printf '%s' "$escaped"
}

ADMIN_SEED_EMAIL="$(trim_trailing_ws "${ADMIN_SEED_EMAIL}")"
ADMIN_SEED_PASSWORD="$(trim_trailing_ws "${ADMIN_SEED_PASSWORD}")"

echo "==> Smoke test login API (http://api:3000/admin/auth/login)"
login_payload="{\"email\":\"$(json_escape_string "${ADMIN_SEED_EMAIL}")\",\"password\":\"$(json_escape_string "${ADMIN_SEED_PASSWORD}")\"}"

http_code="$(
  docker run --rm \
    --network "${NETWORK}" \
    curlimages/curl:8.12.1 \
    curl -sS -o /dev/null -w '%{http_code}' \
      -X POST "http://api:3000/admin/auth/login" \
      -H "Content-Type: application/json" \
      -d "${login_payload}" \
    2>/dev/null || echo "000"
)"

if [[ "${http_code}" != "200" ]]; then
  echo "ERRO: login API retornou HTTP ${http_code} (esperado 200)" >&2
  echo "       verify-operator-seed OK + login API falha => PASSWORD_PEPPER diferente no servico api." >&2
  exit 1
fi

echo "    API login OK (HTTP 200)"

api_container="$(docker ps -q -f "name=${STACK_NAME}_api" | head -n1 || true)"
if [[ -n "${api_container}" ]]; then
  api_pepper_len="$(
    docker exec "${api_container}" node -e "process.stdout.write(String((process.env.PASSWORD_PEPPER||'').length))"
  )"
  expected_len="${#PASSWORD_PEPPER}"
  echo "    PASSWORD_PEPPER length api=${api_pepper_len} expected=${expected_len}"
  if [[ "${api_pepper_len}" != "${expected_len}" ]]; then
    echo "ERRO: PASSWORD_PEPPER no container api difere do .env" >&2
    exit 1
  fi
fi
