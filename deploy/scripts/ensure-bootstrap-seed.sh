#!/usr/bin/env bash
# Verifica CMS home e operador admin no Postgres; executa bootstrap seed quando ausente (ou RUN_SEED=true).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-/opt/vitrine}"
STACK_NAME="${STACK_NAME:-vitrine}"

# shellcheck source=/dev/null
set -a
source "${APP_DIR}/.env"
set +a

POSTGRES_SERVICE="${STACK_NAME}_postgres"

postgres_container() {
  docker ps -q -f "name=${POSTGRES_SERVICE}" | head -n1 || true
}

home_cms_published() {
  local pg_container exists
  pg_container="$(postgres_container)"
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

operator_seed_ready() {
  local pg_container exists email_sql
  pg_container="$(postgres_container)"
  if [[ -z "${pg_container}" ]]; then
    echo "ERRO: container Postgres nao encontrado (${POSTGRES_SERVICE})" >&2
    return 2
  fi

  if [[ -n "${ADMIN_SEED_EMAIL:-}" ]]; then
    email_sql="${ADMIN_SEED_EMAIL//\'/\'\'}"
    exists="$(
      docker exec "${pg_container}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -tAc \
        "SELECT 1 FROM operators WHERE lower(email) = lower('${email_sql}') AND status = 'active' LIMIT 1" \
        2>/dev/null | tr -d '[:space:]'
    )"
  else
    exists="$(
      docker exec "${pg_container}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -tAc \
        "SELECT 1 FROM operators WHERE status = 'active' LIMIT 1" 2>/dev/null | tr -d '[:space:]'
    )"
  fi
  [[ "${exists}" == "1" ]]
}

operator_credentials_valid() {
  bash "${SCRIPT_DIR}/verify-operator-seed.sh"
}

echo "==> Verificando bootstrap CMS (pagina home publicada)"
home_ready=true
if home_cms_published; then
  echo "    Home CMS ja publicada"
else
  home_ready=false
  echo "    Home CMS ausente"
fi

echo "==> Verificando operador admin (seed)"
operator_ready=true
credentials_valid=true
if operator_seed_ready; then
  echo "    Operador admin ativo presente"
  if operator_credentials_valid; then
    echo "    Credenciais conferem com PASSWORD_PEPPER + ADMIN_SEED_*"
  else
    credentials_valid=false
    echo "    Credenciais NAO conferem (pepper/senha desatualizados no banco)"
  fi
else
  operator_ready=false
  credentials_valid=false
  echo "    Operador admin ausente ou inativo"
fi

if [[ "${RUN_SEED:-false}" == "true" ]]; then
  echo "    RUN_SEED=true - reexecutando seed (idempotente)"
  bash "${SCRIPT_DIR}/seed.sh"
elif [[ "${home_ready}" == "true" && "${operator_ready}" == "true" && "${credentials_valid}" == "true" ]]; then
  exit 0
else
  echo "    Executando bootstrap seed (operador, settings, layout home)"
  bash "${SCRIPT_DIR}/seed.sh"
fi

if ! home_cms_published; then
  echo "ERRO: bootstrap seed concluido mas pagina home ainda ausente" >&2
  exit 1
fi

if ! operator_seed_ready; then
  echo "ERRO: bootstrap seed concluido mas operador admin ainda ausente" >&2
  echo "       Confira ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD no .env / secrets do GitHub." >&2
  exit 1
fi

if ! operator_credentials_valid; then
  echo "ERRO: operador existe mas senha/pepper nao conferem apos seed" >&2
  echo "       Confira PASSWORD_PEPPER, ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD." >&2
  exit 1
fi

echo "    Bootstrap seed OK - home CMS e operador admin prontos"
