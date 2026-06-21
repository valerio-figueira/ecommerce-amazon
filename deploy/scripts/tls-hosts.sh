#!/usr/bin/env bash
# Shared www/apex TLS host resolution for Traefik ACME labels, redirects and CORS.

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

escape_domain_regex() {
  printf '%s' "$1" | sed 's/\./\\./g'
}

build_traefik_router_tls_labels() {
  local router="$1"
  local main_host="$2"
  local san_host="$3"
  if [[ "${san_host}" != "${main_host}" ]]; then
    printf -- '- traefik.http.routers.%s.tls=true\n        - traefik.http.routers.%s.tls.certresolver=letsencrypt\n        - traefik.http.routers.%s.tls.domains[0].main=%s\n        - traefik.http.routers.%s.tls.domains[0].sans=%s' \
      "${router}" "${router}" "${router}" "${main_host}" "${router}" "${san_host}"
  else
    printf -- '- traefik.http.routers.%s.tls=true\n        - traefik.http.routers.%s.tls.certresolver=letsencrypt\n        - traefik.http.routers.%s.tls.domains[0].main=%s' \
      "${router}" "${router}" "${router}" "${main_host}"
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
