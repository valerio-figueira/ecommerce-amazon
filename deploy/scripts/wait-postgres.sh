#!/usr/bin/env bash
# Aguarda Postgres saudável no stack antes de rodar migrations.
set -euo pipefail

STACK_NAME="${STACK_NAME:-vitrine}"
SERVICE="${STACK_NAME}_postgres"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-60}"
SLEEP_SECONDS="${SLEEP_SECONDS:-5}"

echo "==> Aguardando serviço ${SERVICE} ficar saudável"
for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
  TASK_ID="$(docker service ps -q -f desired-state=running "${SERVICE}" | head -n1 || true)"
  if [[ -n "${TASK_ID}" ]]; then
    CONTAINER_ID="$(docker inspect --format '{{.Status.ContainerStatus.ContainerID}}' "${TASK_ID}" 2>/dev/null || true)"
    if [[ -n "${CONTAINER_ID}" ]]; then
      if docker exec "${CONTAINER_ID}" pg_isready -U "${POSTGRES_USER:-vitrine}" -d "${POSTGRES_DB:-vitrine}" &>/dev/null; then
        echo "    Postgres pronto (tentativa ${attempt})"
        exit 0
      fi
    fi
  fi
  echo "    ... aguardando (${attempt}/${MAX_ATTEMPTS})"
  sleep "${SLEEP_SECONDS}"
done

echo "ERRO: Postgres não ficou saudável a tempo" >&2
exit 1
