#!/usr/bin/env bash
# Rebuild DATABASE_URL / REDIS_URL for Docker Swarm overlay (service DNS, not VIP IPs).
#
# GitHub secrets or an old .env may contain overlay IPs (10.0.x.x) that become
# unreachable after task restarts — always use postgres/redis hostnames on the stack network.

# RFC 3986 percent-encoding for credentials in DATABASE_URL.
urlencode() {
  local raw="$1" i c
  for ((i = 0; i < ${#raw}; i++)); do
    c="${raw:i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) printf '%s' "$c" ;;
      *) printf '%%%.2X' "'$c" ;;
    esac
  done
}

apply_swarm_overlay_urls() {
  export POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
  export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
  export REDIS_HOST="${REDIS_HOST:-redis}"
  export REDIS_PORT="${REDIS_PORT:-6379}"

  : "${POSTGRES_USER:?POSTGRES_USER is required}"
  : "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
  : "${POSTGRES_DB:?POSTGRES_DB is required}"

  export DATABASE_URL="$(build_database_url "${POSTGRES_HOST}")"
  export REDIS_URL="redis://${REDIS_HOST}:${REDIS_PORT}"
}

build_database_url() {
  local host="$1"
  local user_enc pass_enc
  user_enc="$(urlencode "${POSTGRES_USER}")"
  pass_enc="$(urlencode "${POSTGRES_PASSWORD}")"
  printf 'postgresql://%s:%s@%s:%s/%s' \
    "${user_enc}" "${pass_enc}" "${host}" "${POSTGRES_PORT:-5432}" "${POSTGRES_DB}"
}

# One-shot jobs (migrate/seed) join the postgres task network namespace — avoids overlay
# EHOSTUNREACH from ephemeral `docker run` containers on some Swarm single-node setups.
apply_postgres_sidecar_database_url() {
  export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
  : "${POSTGRES_USER:?POSTGRES_USER is required}"
  : "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
  : "${POSTGRES_DB:?POSTGRES_DB is required}"
  export DATABASE_URL="$(build_database_url "127.0.0.1")"
}

