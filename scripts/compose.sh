#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! systemctl --user is-active --quiet podman.socket 2>/dev/null; then
  systemctl --user start podman.socket
fi

export DOCKER_HOST="${DOCKER_HOST:-unix://${XDG_RUNTIME_DIR}/podman/podman.sock}"

exec podman compose "$@"
