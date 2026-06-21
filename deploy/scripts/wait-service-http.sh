#!/usr/bin/env bash
# Aguarda task Swarm responder HTTP dentro do container (cold start Next.js).
# Usa Node (presente na imagem) — node:20-alpine nao inclui wget/curl.
# Uso: wait-service-http.sh <web|admin|api> <path> <port>
set -euo pipefail

STACK_NAME="${STACK_NAME:-vitrine}"
SERVICE_SUFFIX="${1:?service suffix required (web, admin, api)}"
HTTP_PATH="${2:?HTTP path required (e.g. / or /admin/login)}"
INTERNAL_PORT="${3:?internal port required}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-36}"
SLEEP_SECONDS="${SLEEP_SECONDS:-5}"

SERVICE="${STACK_NAME}_${SERVICE_SUFFIX}"

probe_container_http() {
  local container_id="$1"
  docker exec \
    -e PROBE_PORT="${INTERNAL_PORT}" \
    -e PROBE_PATH="${HTTP_PATH}" \
    "${container_id}" \
    node -e "
const http = require('http');
const port = process.env.PROBE_PORT;
const path = process.env.PROBE_PATH;
const req = http.get({ hostname: '127.0.0.1', port, path, timeout: 8000 }, (res) => {
  res.resume();
  process.exit(res.statusCode >= 200 && res.statusCode < 400 ? 0 : 1);
});
req.on('timeout', () => { req.destroy(); process.exit(1); });
req.on('error', () => process.exit(1));
"
}

report_service_failure() {
  echo "ERRO: ${SERVICE} nao respondeu HTTP a tempo em ${HTTP_PATH}" >&2
  echo "---- docker service ps ${SERVICE} ----" >&2
  docker service ps "${SERVICE}" --no-trunc 2>&1 | tail -8 >&2 || true
  echo "---- docker service logs ${SERVICE} (ultimas 40 linhas) ----" >&2
  docker service logs "${SERVICE}" --tail 40 2>&1 >&2 || true
}

echo "==> Aguardando ${SERVICE} responder em 127.0.0.1:${INTERNAL_PORT}${HTTP_PATH}"
for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
  TASK_ID="$(docker service ps -q -f desired-state=running "${SERVICE}" | head -n1 || true)"
  if [[ -n "${TASK_ID}" ]]; then
    CONTAINER_ID="$(docker inspect --format '{{.Status.ContainerStatus.ContainerID}}' "${TASK_ID}" 2>/dev/null || true)"
    if [[ -n "${CONTAINER_ID}" ]] && probe_container_http "${CONTAINER_ID}"; then
      echo "    ${SERVICE} pronto (tentativa ${attempt})"
      exit 0
    fi
  fi
  echo "    ... aguardando ${SERVICE} (${attempt}/${MAX_ATTEMPTS})"
  sleep "${SLEEP_SECONDS}"
done

report_service_failure
exit 1
