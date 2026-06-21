#!/usr/bin/env bash
# Aguarda task Swarm responder HTTP dentro do container (cold start Next.js).
# Uso: wait-service-http.sh <web|admin|api> <path> <port>
set -euo pipefail

STACK_NAME="${STACK_NAME:-vitrine}"
SERVICE_SUFFIX="${1:?service suffix required (web, admin, api)}"
HTTP_PATH="${2:?HTTP path required (e.g. / or /admin/login)}"
INTERNAL_PORT="${3:?internal port required}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-36}"
SLEEP_SECONDS="${SLEEP_SECONDS:-5}"

SERVICE="${STACK_NAME}_${SERVICE_SUFFIX}"

echo "==> Aguardando ${SERVICE} responder em 127.0.0.1:${INTERNAL_PORT}${HTTP_PATH}"
for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
  TASK_ID="$(docker service ps -q -f desired-state=running "${SERVICE}" | head -n1 || true)"
  if [[ -n "${TASK_ID}" ]]; then
    CONTAINER_ID="$(docker inspect --format '{{.Status.ContainerStatus.ContainerID}}' "${TASK_ID}" 2>/dev/null || true)"
    if [[ -n "${CONTAINER_ID}" ]]; then
      if docker exec "${CONTAINER_ID}" wget -qO- "http://127.0.0.1:${INTERNAL_PORT}${HTTP_PATH}" >/dev/null 2>&1; then
        echo "    ${SERVICE} pronto (tentativa ${attempt})"
        exit 0
      fi
    fi
  fi
  echo "    ... aguardando ${SERVICE} (${attempt}/${MAX_ATTEMPTS})"
  sleep "${SLEEP_SECONDS}"
done

echo "ERRO: ${SERVICE} nao respondeu HTTP a tempo em ${HTTP_PATH}" >&2
exit 1
