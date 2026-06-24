#!/usr/bin/env bash
# Allow Swarm overlay east-west traffic in UFW DOCKER-USER (fixes EHOSTUNREACH between services).
# Run as root on an already-provisioned VPS — idempotent, no ufw reset.
#
# Symptom: vitrine_api logs show connect EHOSTUNREACH 10.0.x.x:5432|6379 while postgres/redis are healthy.
set -euo pipefail

UFW_AFTER_RULES="/etc/ufw/after.rules"
OVERLAY_MARKER="# vitrine-swarm-overlay-east-west"
OVERLAY_RULE="-A ufw-user-forward -s 10.0.0.0/8 -d 10.0.0.0/8 -j RETURN"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "ERRO: execute como root (ou sudo bash $0)" >&2
  exit 1
fi

if [[ ! -f "${UFW_AFTER_RULES}" ]]; then
  echo "ERRO: ${UFW_AFTER_RULES} não encontrado — rode bootstrap-vps.sh primeiro" >&2
  exit 1
fi

export LANG=C
export LC_ALL=C

if grep -qF "${OVERLAY_MARKER}" "${UFW_AFTER_RULES}"; then
  echo "==> Regra overlay Swarm já presente em ${UFW_AFTER_RULES}"
else
  if ! grep -qF "ufw-user-forward" "${UFW_AFTER_RULES}"; then
    echo "ERRO: cadeia ufw-user-forward ausente — rode bootstrap-vps.sh" >&2
    exit 1
  fi

  echo "==> Inserindo regra overlay Swarm em ${UFW_AFTER_RULES}"
  # Insert after ESTABLISHED RETURN, before 80/443 rules (or before final DROP).
  awk -v marker="${OVERLAY_MARKER}" -v rule="${OVERLAY_RULE}" '
    /-A ufw-user-forward -m conntrack --ctstate RELATED,ESTABLISHED -j RETURN/ && !done {
      print
      print marker
      print rule
      done=1
      next
    }
    { print }
  ' "${UFW_AFTER_RULES}" >"${UFW_AFTER_RULES}.tmp"
  mv "${UFW_AFTER_RULES}.tmp" "${UFW_AFTER_RULES}"
fi

echo "==> Recarregando UFW"
ufw reload

echo "==> Patch concluído — tráfego overlay 10.0.0.0/8 liberado entre containers Swarm"
