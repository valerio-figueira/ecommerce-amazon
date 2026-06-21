#!/usr/bin/env bash
# Verifica CMS home no Postgres e executa bootstrap seed quando ausente (ou RUN_SEED=true).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-/opt/vitrine}"
STACK_NAME="${STACK_NAME:-vitrine}"

# shellcheck source=/dev/null
set -a
source "${APP_DIR}/.env"
set +a

POSTGRES_SERVICE="${STACK_NAME}_postgres"

home_cms_published() {
  local pg_container exists
  pg_container="$(docker ps -q -f "name=${POSTGRES_SERVICE}" | head -n1 || true)"
  if [[ -z "${pg_container}" ]]; then
    echo "ERRO: container Postgres nao encontrado (${POSTGRES_SERVICE})" >&2
    return 2
  fi
  exists="$(
    docker exec "${pg_container}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -tAc \
      "SELECT 1 FROM pages WHERE slug = 'home' AND status = 'published' LIMIT 1" 2>/dev/null \
      | tr -d '[:space:]'
  )"
  [[ "${exists}" == "1" ]]
}

echo "==> Verificando bootstrap CMS (pagina home publicada)"
if home_cms_published; then
  echo "    Home CMS ja publicada"
  if [[ "${RUN_SEED:-false}" == "true" ]]; then
    echo "    RUN_SEED=true — reexecutando seed (idempotente)"
    bash "${SCRIPT_DIR}/seed.sh"
  fi
  exit 0
fi

echo "    Home CMS ausente — executando bootstrap seed (operador, settings, layout home)"
bash "${SCRIPT_DIR}/seed.sh"

if ! home_cms_published; then
  echo "ERRO: bootstrap seed concluido mas pagina home ainda ausente" >&2
  exit 1
fi

echo "    Bootstrap seed OK — home CMS publicada"
