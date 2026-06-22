#!/usr/bin/env bash
# Garante que o container web alcança a API pela overlay Swarm (sem hairpin pela URL pública).
set -euo pipefail

STACK_NAME="${STACK_NAME:-vitrine}"
SERVICE="${STACK_NAME}_web"

TASK_ID="$(docker service ps -q -f desired-state=running "${SERVICE}" | head -n1 || true)"
if [[ -z "${TASK_ID}" ]]; then
  echo "ERRO: nenhuma task running para ${SERVICE}" >&2
  docker service ps "${SERVICE}" --no-trunc 2>&1 | tail -8 >&2 || true
  exit 1
fi

CONTAINER_ID="$(docker inspect --format '{{.Status.ContainerStatus.ContainerID}}' "${TASK_ID}" 2>/dev/null || true)"
if [[ -z "${CONTAINER_ID}" ]]; then
  echo "ERRO: container ID vazio para ${SERVICE}" >&2
  exit 1
fi

echo "==> Smoke: web → API overlay (http://api:3000/health/ready)"
docker exec "${CONTAINER_ID}" node -e "
const http = require('http');
http
  .get('http://api:3000/health/ready', (res) => {
    console.log('overlay-api-status', res.statusCode);
    res.resume();
    process.exit(res.statusCode === 200 ? 0 : 1);
  })
  .on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
"

echo "==> Smoke: web SSR home (127.0.0.1:3001/)"
docker exec \
  -e PROBE_PORT=3001 \
  -e PROBE_PATH=/ \
  "${CONTAINER_ID}" \
  node -e "
const http = require('http');
const req = http.get(
  { hostname: '127.0.0.1', port: process.env.PROBE_PORT, path: process.env.PROBE_PATH, timeout: 15000 },
  (res) => {
    console.log('home-status', res.statusCode);
    res.resume();
    process.exit(res.statusCode >= 200 && res.statusCode < 400 ? 0 : 1);
  },
);
req.on('timeout', () => { req.destroy(); process.exit(1); });
req.on('error', () => process.exit(1));
"

echo "    web internal smoke OK"
