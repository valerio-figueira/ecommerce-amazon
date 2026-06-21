#!/usr/bin/env bash
# Build `docker run -e KEY` args from a .env path (values come from the current shell).
#
# `docker run --env-file` does not interpret bash `printf %q` escapes and keeps literal
# double quotes from quoted .env lines. Scripts must `source` the .env first, then call
# collect_docker_env_passthrough_args so Docker receives the parsed values via `-e KEY`.

collect_docker_env_passthrough_args() {
  local env_file="$1"
  local out_name="$2"
  local -n out_ref="$out_name"

  out_ref=()
  local line key
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    key="${line%%=*}"
    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"
    [[ -z "$key" ]] && continue
    out_ref+=(-e "$key")
  done <"$env_file"
}
