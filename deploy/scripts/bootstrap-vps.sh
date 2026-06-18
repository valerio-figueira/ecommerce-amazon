#!/usr/bin/env bash
# Bootstrap único para VPS Debian 12 — Docker CE, Swarm, usuário deploy, firewall.
# Executar como root: bash deploy/scripts/bootstrap-vps.sh
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="/opt/vitrine"

echo "==> Instalando dependências do sistema"
apt-get update
apt-get install -y ca-certificates curl gnupg ufw gettext-base wget python3

echo "==> Instalando Docker CE (repositório oficial)"
install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
  curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  >/etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "==> Criando usuário ${DEPLOY_USER}"
if ! id "${DEPLOY_USER}" &>/dev/null; then
  useradd -m -s /bin/bash "${DEPLOY_USER}"
  usermod -aG docker "${DEPLOY_USER}"
fi

echo "==> Inicializando Docker Swarm (single-node)"
if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q active; then
  docker swarm init
fi

echo "==> Preparando diretórios em ${APP_DIR}"
mkdir -p "${APP_DIR}/traefik" "${APP_DIR}/stack"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

echo "==> Configurando UFW (22 SSH + 80 HTTP; 443 após TLS_ENABLED=true)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
# Descomente após migrar para domínio + HTTPS:
# ufw allow 443/tcp
ufw --force enable

echo "==> Bootstrap concluído"
echo "    Próximos passos:"
echo "    1. Adicionar chave SSH pública em /home/${DEPLOY_USER}/.ssh/authorized_keys"
echo "    2. Configurar secrets no GitHub Environment 'production'"
echo "    3. Disparar workflow deploy-production com run_seed=true no primeiro deploy"
