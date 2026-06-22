#!/usr/bin/env bash
# Aguarda task Swarm em estado running (container criado) antes de probes HTTP.
# Uso: wait-swarm-service.sh <web|admin|api|worker|traefik>
set -euo pipefail

STACK_NAME="${STACK_NAME:-vitrine}"
SERVICE_SUFFIX="${1:?service suffix required}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-36}"
SLEEP_SECONDS="${SLEEP_SECONDS:-5}"

SERVICE="${STACK_NAME}_${SERVICE_SUFFIX}"

report_service_failure() {
  echo "ERRO: ${SERVICE} sem task running" >&2
  echo "---- docker service ps ${SERVICE} ----" >&2
  docker service ps "${SERVICE}" --no-trunc 2>&1 | tail -10 >&2 || true
  echo "---- docker service logs ${SERVICE} (ultimas 40 linhas) ----" >&2
  docker service logs "${SERVICE}" --tail 40 2>&1 >&2 || true
}

echo "==> Aguardando task running: ${SERVICE}"
for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
  TASK_ID="$(docker service ps -q -f desired-state=running "${SERVICE}" | head -n1 || true)"
  if [[ -n "${TASK_ID}" ]]; then
    CONTAINER_ID="$(docker inspect --format '{{.Status.ContainerStatus.ContainerID}}' "${TASK_ID}" 2>/dev/null || true)"
    if [[ -n "${CONTAINER_ID}" ]]; then
      echo "    ${SERVICE} task running (tentativa ${attempt})"
      exit 0
    fi
  fi
  echo "    ... aguardando ${SERVICE} (${attempt}/${MAX_ATTEMPTS})"
  sleep "${SLEEP_SECONDS}"
done

report_service_failure
exit 1
