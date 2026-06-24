#!/usr/bin/env bash
# Public host resolution for Swarm deploy: subdomains (api./admin.), TLS SANs, Traefik labels.

# Sets: URL_SCHEME, WEB_CANONICAL_HOST, APEX_DOMAIN, DEPLOY_ROUTING_MODE,
# API_PUBLIC_HOST, ADMIN_PUBLIC_HOST, API_PUBLIC_URL, ADMIN_PUBLIC_URL, ADMIN_BASE_PATH
resolve_public_hosts_from_base_url() {
  local base_url="$1"
  URL_SCHEME="${base_url%%://*}"
  WEB_CANONICAL_HOST="${base_url#*://}"
  WEB_CANONICAL_HOST="${WEB_CANONICAL_HOST%%/*}"

  if [[ "${WEB_CANONICAL_HOST}" =~ ^[0-9.]+$ || "${WEB_CANONICAL_HOST}" == *:* ]]; then
    DEPLOY_ROUTING_MODE="path"
    APEX_DOMAIN="${WEB_CANONICAL_HOST}"
    API_PUBLIC_HOST="${WEB_CANONICAL_HOST}"
    ADMIN_PUBLIC_HOST="${WEB_CANONICAL_HOST}"
    API_PUBLIC_URL="${URL_SCHEME}://${WEB_CANONICAL_HOST}/api"
    ADMIN_PUBLIC_URL="${URL_SCHEME}://${WEB_CANONICAL_HOST}/admin"
    ADMIN_BASE_PATH="/admin"
    return 0
  fi

  DEPLOY_ROUTING_MODE="subdomain"
  if [[ "${WEB_CANONICAL_HOST}" == www.* ]]; then
    APEX_DOMAIN="${WEB_CANONICAL_HOST#www.}"
  else
    APEX_DOMAIN="${WEB_CANONICAL_HOST}"
  fi

  API_PUBLIC_HOST="api.${APEX_DOMAIN}"
  ADMIN_PUBLIC_HOST="admin.${APEX_DOMAIN}"
  API_PUBLIC_URL="${URL_SCHEME}://${API_PUBLIC_HOST}"
  ADMIN_PUBLIC_URL="${URL_SCHEME}://${ADMIN_PUBLIC_HOST}"
  ADMIN_BASE_PATH=""
}

resolve_tls_hosts_from_public_host() {
  local host="$1"
  TLS_CANONICAL_HOST="${host}"
  TLS_SAN_HOST="${host}"
  TLS_REDIRECT_FROM_HOST="impossible.invalid"

  if [[ "${host}" == *.* && ! "${host}" =~ ^[0-9.]+$ && "${host}" != *:* ]]; then
    if [[ "${host}" == www.* ]]; then
      TLS_SAN_HOST="${host#www.}"
    else
      TLS_SAN_HOST="www.${host}"
    fi
  fi

  if [[ "${TLS_SAN_HOST}" != "${TLS_CANONICAL_HOST}" ]]; then
    TLS_REDIRECT_FROM_HOST="${TLS_SAN_HOST}"
  fi
}

# Comma-separated SANs for the vitrine host only (apex/www alias) - used by static alias routers.
# api./admin. get their own cert via per-service TLS labels (one ACME order per hostname).
build_tls_sans_csv() {
  local host="$1"

  resolve_tls_hosts_from_public_host "${host}"
  if [[ "${TLS_SAN_HOST}" != "${TLS_CANONICAL_HOST}" ]]; then
    TLS_SANS_CSV="${TLS_SAN_HOST}"
  else
    TLS_SANS_CSV=""
  fi
}

# Per-router ACME domain: vitrine (www+apex), api, or admin - avoids duplicate multi-SAN orders.
build_traefik_service_tls_labels() {
  local router="$1"
  case "${router}" in
    vitrine-web)
      build_traefik_router_tls_labels "${router}" "${WEB_CANONICAL_HOST}" "${TLS_SANS_CSV}"
      ;;
    vitrine-api)
      if [[ "${DEPLOY_ROUTING_MODE:-}" == "subdomain" ]]; then
        build_traefik_router_tls_labels "${router}" "${API_PUBLIC_HOST}" ""
      else
        build_traefik_router_tls_labels "${router}" "${WEB_CANONICAL_HOST}" "${TLS_SANS_CSV}"
      fi
      ;;
    vitrine-admin)
      if [[ "${DEPLOY_ROUTING_MODE:-}" == "subdomain" ]]; then
        build_traefik_router_tls_labels "${router}" "${ADMIN_PUBLIC_HOST}" ""
      else
        build_traefik_router_tls_labels "${router}" "${WEB_CANONICAL_HOST}" "${TLS_SANS_CSV}"
      fi
      ;;
    *)
      echo "unknown traefik router: ${router}" >&2
      return 1
      ;;
  esac
}

escape_domain_regex() {
  printf '%s' "$1" | sed 's/\./\\./g'
}

build_traefik_router_tls_labels() {
  local router="$1"
  local main_host="$2"
  local sans_csv="$3"
  if [[ -n "${sans_csv}" ]]; then
    printf -- '- traefik.http.routers.%s.tls=true\n        - traefik.http.routers.%s.tls.certresolver=letsencrypt\n        - traefik.http.routers.%s.tls.domains[0].main=%s\n        - traefik.http.routers.%s.tls.domains[0].sans=%s' \
      "${router}" "${router}" "${router}" "${main_host}" "${router}" "${sans_csv}"
  else
    printf -- '- traefik.http.routers.%s.tls=true\n        - traefik.http.routers.%s.tls.certresolver=letsencrypt\n        - traefik.http.routers.%s.tls.domains[0].main=%s' \
      "${router}" "${router}" "${router}" "${main_host}"
  fi
}

build_traefik_api_router_labels() {
  local entrypoint="$1"
  if [[ "${DEPLOY_ROUTING_MODE}" == "subdomain" ]]; then
    printf -- '- traefik.http.routers.vitrine-api.rule=Host(`%s`)\n        - traefik.http.routers.vitrine-api.entrypoints=%s\n        - traefik.http.services.vitrine-api.loadbalancer.server.port=3000' \
      "${API_PUBLIC_HOST}" "${entrypoint}"
  else
    printf -- '- traefik.http.routers.vitrine-api.rule=PathPrefix(`/api`)\n        - traefik.http.routers.vitrine-api.entrypoints=%s\n        - traefik.http.routers.vitrine-api.priority=30\n        - traefik.http.middlewares.vitrine-api-strip.stripprefix.prefixes=/api\n        - traefik.http.routers.vitrine-api.middlewares=vitrine-api-strip\n        - traefik.http.services.vitrine-api.loadbalancer.server.port=3000' \
      "${entrypoint}"
  fi
}

build_traefik_admin_router_labels() {
  local entrypoint="$1"
  if [[ "${DEPLOY_ROUTING_MODE}" == "subdomain" ]]; then
    printf -- '- traefik.http.routers.vitrine-admin.rule=Host(`%s`)\n        - traefik.http.routers.vitrine-admin.entrypoints=%s\n        - traefik.http.services.vitrine-admin.loadbalancer.server.port=3002' \
      "${ADMIN_PUBLIC_HOST}" "${entrypoint}"
  else
    printf -- '- traefik.http.routers.vitrine-admin.rule=PathPrefix(`/admin`)\n        - traefik.http.routers.vitrine-admin.entrypoints=%s\n        - traefik.http.routers.vitrine-admin.priority=20\n        - traefik.http.services.vitrine-admin.loadbalancer.server.port=3002' \
      "${entrypoint}"
  fi
}

build_traefik_web_router_labels() {
  local entrypoint="$1"
  if [[ "${DEPLOY_ROUTING_MODE}" == "subdomain" ]]; then
    if [[ "${TLS_SAN_HOST}" != "${WEB_CANONICAL_HOST}" && "${TLS_SAN_HOST}" != "impossible.invalid" ]]; then
      printf -- '- traefik.http.routers.vitrine-web.rule=Host(`%s`) || Host(`%s`)\n        - traefik.http.routers.vitrine-web.entrypoints=%s\n        - traefik.http.services.vitrine-web.loadbalancer.server.port=3001' \
        "${WEB_CANONICAL_HOST}" "${TLS_SAN_HOST}" "${entrypoint}"
    else
      printf -- '- traefik.http.routers.vitrine-web.rule=Host(`%s`)\n        - traefik.http.routers.vitrine-web.entrypoints=%s\n        - traefik.http.services.vitrine-web.loadbalancer.server.port=3001' \
        "${WEB_CANONICAL_HOST}" "${entrypoint}"
    fi
  else
    printf -- '- traefik.http.routers.vitrine-web.rule=PathPrefix(`/`)'"\n"'        - traefik.http.routers.vitrine-web.entrypoints=%s'"\n"'        - traefik.http.routers.vitrine-web.priority=10'"\n"'        - traefik.http.services.vitrine-web.loadbalancer.server.port=3001' \
      "${entrypoint}"
  fi
}

derive_alt_public_origin() {
  local base_url="$1"
  local host scheme alt_host
  host="${base_url#*://}"
  host="${host%%/*}"
  scheme="${base_url%%://*}"
  if [[ "${host}" == *.* && ! "${host}" =~ ^[0-9.]+$ && "${host}" != *:* ]]; then
    if [[ "${host}" == www.* ]]; then
      alt_host="${host#www.}"
    else
      alt_host="www.${host}"
    fi
    if [[ "${alt_host}" != "${host}" ]]; then
      printf '%s://%s' "${scheme}" "${alt_host}"
      return 0
    fi
  fi
  return 1
}

# YAML list lines for traefik.https.yml static cert sans (leading spaces included).
build_traefik_tls_sans_yaml() {
  local sans_csv="$1"
  local san
  TRAEFIK_TLS_SANS_YAML=""
  if [[ -z "${sans_csv}" ]]; then
    return 0
  fi
  IFS=',' read -r -a _sans_array <<<"${sans_csv}"
  for san in "${_sans_array[@]}"; do
    TRAEFIK_TLS_SANS_YAML+="              - ${san}"$'\n'
  done
}
