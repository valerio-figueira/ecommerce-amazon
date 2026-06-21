#!/usr/bin/env bash
# Smoke test: API → web overlay POST /api/revalidate (mesma rota do PublicWebRevalidator).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/vitrine}"
STACK_NAME="${STACK_NAME:-vitrine}"

# shellcheck source=/dev/null
set -a
source "${APP_DIR}/.env"
set +a

: "${REVALIDATE_SECRET:?REVALIDATE_SECRET is required}"
: "${WEB_INTERNAL_URL:?WEB_INTERNAL_URL is required}"

WEB_INTERNAL_URL="${WEB_INTERNAL_URL%/}"
REVALIDATE_URL="${WEB_INTERNAL_URL}/api/revalidate"

API_CONTAINER="$(docker ps -q -f "name=${STACK_NAME}_api" | head -n1 || true)"
if [[ -z "${API_CONTAINER}" ]]; then
  echo "ERRO: container ${STACK_NAME}_api não encontrado" >&2
  exit 1
fi

echo "==> Testando revalidate via rede overlay (${REVALIDATE_URL})"

docker exec \
  -e "REVALIDATE_URL=${REVALIDATE_URL}" \
  -e "REVALIDATE_SECRET=${REVALIDATE_SECRET}" \
  "${API_CONTAINER}" \
  node -e "
const url = process.env.REVALIDATE_URL;
const secret = process.env.REVALIDATE_SECRET;
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + secret,
  },
  body: JSON.stringify({ tags: ['public:team-members'], paths: ['/sobre'] }),
})
  .then(async (response) => {
    const body = await response.text();
    process.stdout.write('HTTP ' + response.status + ' ' + body + '\n');
    process.exit(response.ok ? 0 : 1);
  })
  .catch((error) => {
    process.stderr.write(String(error) + '\n');
    process.exit(1);
  });
"

echo "==> OK — revalidate respondeu 200"
