#!/usr/bin/env bash
# Bootstrap único para VPS Debian 12 - Docker CE, Swarm, usuário deploy, firewall.
# Executar como root: bash deploy/scripts/bootstrap-vps.sh
#
# Mitigações de segurança:
# - V2: UFW + cadeia DOCKER-USER bloqueia portas Docker publicadas além de 80/443.
# - daemon.json antes de swarm init; Traefik permanece único ponto de entrada público.
# - Invariante: apenas traefik no stack deve ter bloco ports: (Postgres/Redis só overlay).
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-desksetup}"
APP_DIR="/opt/vitrine"
UFW_AFTER_RULES="/etc/ufw/after.rules"
UFW_DOCKER_BEGIN="# BEGIN vitrine-docker"
UFW_DOCKER_END="# END vitrine-docker"

configure_docker_daemon() {
  echo "==> Configurando /etc/docker/daemon.json"
  install -d -m 0755 /etc/docker
  # live-restore is incompatible with Swarm mode - do not enable on production VPS.
  cat >/etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "iptables": true,
  "ip-forward": true,
  "userland-proxy": false
}
EOF
  systemctl enable docker
  systemctl restart docker
}

inject_ufw_docker_block() {
  # Idempotente: remove bloco anterior e reinsere após ufw reset.
  if grep -qF "${UFW_DOCKER_BEGIN}" "${UFW_AFTER_RULES}"; then
    sed -i "/${UFW_DOCKER_BEGIN}/,/${UFW_DOCKER_END}/d" "${UFW_AFTER_RULES}"
  fi

  # UFW backend writes rule files with ASCII only - no accented chars in this heredoc.
  cat >>"${UFW_AFTER_RULES}" <<'EOF'

# BEGIN vitrine-docker
# Mitigates UFW bypass for Docker-published ports (FORWARD/DOCKER-USER chain).
# Only Traefik (80/443 host-mode) should be reachable from the internet.
# Swarm overlay east-west (10.0.0.0/8) must pass - otherwise api/worker get EHOSTUNREACH to postgres/redis VIPs.
*filter
:ufw-user-forward - [0:0]
:DOCKER-USER - [0:0]
-A DOCKER-USER -j ufw-user-forward
-A ufw-user-forward -m conntrack --ctstate RELATED,ESTABLISHED -j RETURN
# vitrine-swarm-overlay-east-west
-A ufw-user-forward -s 10.0.0.0/8 -d 10.0.0.0/8 -j RETURN
-A ufw-user-forward -p tcp -m tcp --dport 80 -j RETURN
-A ufw-user-forward -p tcp -m tcp --dport 443 -j RETURN
-A ufw-user-forward -j DROP
COMMIT
# END vitrine-docker
EOF
}

configure_ufw_docker_integration() {
  echo "==> Configurando UFW + integração Docker (DOCKER-USER)"

  # Reset limpa regras INPUT; after.rules customizado é reinjetado em seguida.
  # UFW Python backend requires ASCII (LANG=C) when reading/writing rule files.
  export LANG=C
  export LC_ALL=C

  ufw --force reset

  if grep -q '^DEFAULT_FORWARD_POLICY=' /etc/default/ufw; then
    sed -i 's/^DEFAULT_FORWARD_POLICY=.*/DEFAULT_FORWARD_POLICY="ACCEPT"/' /etc/default/ufw
  else
    echo 'DEFAULT_FORWARD_POLICY="ACCEPT"' >>/etc/default/ufw
  fi

  inject_ufw_docker_block

  ufw default deny incoming
  ufw default allow outgoing
  ufw allow OpenSSH
  ufw allow 80/tcp
  # Descomente após migrar para domínio + HTTPS:
  # ufw allow 443/tcp
  ufw --force enable
  ufw reload
}

assert_stack_no_internal_ports() {
  local stack_file="${APP_DIR}/deploy/docker-stack.yml"
  if [[ ! -f "${stack_file}" ]]; then
    return 0
  fi

  if awk '
    /^  postgres:/ { svc="postgres"; next }
    /^  redis:/ { svc="redis"; next }
    /^  [a-z]/ && !/^  postgres:/ && !/^  redis:/ { svc="" }
    svc != "" && /published:/ { found=1; exit }
    END { exit found ? 0 : 1 }
  ' "${stack_file}"; then
    echo "ERRO: ${stack_file} expõe postgres/redis com published - remova ports: desses serviços" >&2
    exit 1
  fi
}

ensure_swarm_init() {
  echo "==> Inicializando Docker Swarm (single-node)"
  local state
  state="$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null || echo inactive)"
  if [[ "${state}" != "active" ]]; then
    docker swarm init
  else
    echo "    Swarm ja ativo"
  fi
}

echo "==> Instalando dependências do sistema"
apt-get update
apt-get install -y ca-certificates curl gnupg ufw gettext-base wget

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

configure_docker_daemon

echo "==> Criando usuário ${DEPLOY_USER}"
if ! id "${DEPLOY_USER}" &>/dev/null; then
  useradd -m -s /bin/bash "${DEPLOY_USER}"
fi
usermod -aG docker "${DEPLOY_USER}"

SUDOERS_DROPIN="/etc/sudoers.d/vitrine-deploy"
cat >"${SUDOERS_DROPIN}" <<EOF
# Allow deploy user to patch UFW overlay rule without full bootstrap reset.
${DEPLOY_USER} ALL=(ALL) NOPASSWD: ${APP_DIR}/deploy/scripts/patch-ufw-docker-overlay.sh
EOF
chmod 440 "${SUDOERS_DROPIN}"

echo "==> Preparando diretórios em ${APP_DIR}"
mkdir -p "${APP_DIR}/traefik" "${APP_DIR}/stack"
chmod 750 "${APP_DIR}"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

ensure_swarm_init

configure_ufw_docker_integration

assert_stack_no_internal_ports

echo "==> Bootstrap concluído"
echo "    Próximos passos:"
echo "    1. Adicionar chave SSH pública em /home/${DEPLOY_USER}/.ssh/authorized_keys"
echo "    2. Configurar secrets no GitHub Environment 'production'"
echo "    3. Disparar workflow deploy-production com run_seed=true no primeiro deploy"
echo "    4. Ao migrar para HTTPS: ufw allow 443/tcp && ufw reload"
