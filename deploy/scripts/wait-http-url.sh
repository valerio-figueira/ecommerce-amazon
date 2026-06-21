#!/usr/bin/env bash
# Aguarda URL publica (Traefik) retornar codigos HTTP aceitos — retry para rotas apos stack deploy.
# Uso: wait-http-url.sh <url> [accepted_codes_csv]
set -euo pipefail

URL="${1:?URL is required}"
ACCEPT_CODES="${2:-200,304}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-36}"
SLEEP_SECONDS="${SLEEP_SECONDS:-5}"

echo "==> Aguardando ${URL} (aceito: ${ACCEPT_CODES})"
for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
  HTTP_CODE="$(curl -s -o /dev/null -w '%{http_code}' "${URL}" || true)"
  if [[ ",${ACCEPT_CODES}," == *",${HTTP_CODE},"* ]]; then
    echo "    OK HTTP ${HTTP_CODE} (tentativa ${attempt})"
    exit 0
  fi
  echo "    ... HTTP ${HTTP_CODE:-000} (${attempt}/${MAX_ATTEMPTS})"
  sleep "${SLEEP_SECONDS}"
done

echo "ERRO: ${URL} nao retornou ${ACCEPT_CODES} a tempo (ultimo: ${HTTP_CODE:-000})" >&2
exit 1
