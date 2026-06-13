#!/usr/bin/env bash
set -euo pipefail

USER_NAME="${1:-$(id -un)}"

if ! getent group docker >/dev/null; then
  echo "Grupo 'docker' não existe. Instale o Docker Engine primeiro."
  exit 1
fi

if id -nG "$USER_NAME" | tr ' ' '\n' | grep -qx docker; then
  echo "Usuário '$USER_NAME' já está no grupo docker."
else
  echo "Adicionando '$USER_NAME' ao grupo docker (sudo)..."
  sudo usermod -aG docker "$USER_NAME"
  echo "Feito."
fi

echo
echo "Membros do grupo docker:"
getent group docker
echo
echo "IMPORTANTE: faça logout/login OU execute neste terminal:"
echo "  newgrp docker"
echo
echo "Depois teste:"
echo "  docker compose up -d"
echo "  # ou: npm run infra:up   (Podman rootless, sem grupo docker)"
