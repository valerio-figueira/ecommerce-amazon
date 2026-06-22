#!/usr/bin/env bash
# Remove imagens antigas vitrine-* na VPS apos deploy bem-sucedido.
# Mantem a tag do deploy atual, `latest` e qualquer imagem ainda em uso pelo Swarm.
#
# Env (opcional):
#   DOCKER_IMAGE_PRUNE_ENABLED=true|false  (default: true)
#   DOCKER_IMAGE_PRUNE_KEEP_TAGS=latest    (tags extras a preservar, separadas por virgula)
#   GHCR_IMAGE_PREFIX, IMAGE_TAG             (obrigatorios quando chamado pelo deploy.sh)
set -uo pipefail

GHCR_IMAGE_PREFIX="${GHCR_IMAGE_PREFIX:?GHCR_IMAGE_PREFIX is required}"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
PRUNE_ENABLED="${DOCKER_IMAGE_PRUNE_ENABLED:-true}"
KEEP_TAGS_CSV="${DOCKER_IMAGE_PRUNE_KEEP_TAGS:-latest}"

if [[ "${PRUNE_ENABLED}" != "true" ]]; then
  echo "==> Limpeza de imagens Docker ignorada (DOCKER_IMAGE_PRUNE_ENABLED=${PRUNE_ENABLED})"
  exit 0
fi

declare -A KEEP_TAGS=()
KEEP_TAGS["${IMAGE_TAG}"]=1
while IFS= read -r extra_tag; do
  extra_tag="${extra_tag// /}"
  if [[ -n "${extra_tag}" ]]; then
    KEEP_TAGS["${extra_tag}"]=1
  fi
done < <(printf '%s' "${KEEP_TAGS_CSV}" | tr ',' '\n')

VITRINE_APPS=(api worker web admin migrate)
removed_tags=0
skipped_in_use=0

echo "==> Limpeza de imagens Docker antigas"
echo "    Repositorio: ${GHCR_IMAGE_PREFIX}/vitrine-*"
echo "    Mantendo tags: ${IMAGE_TAG}, ${KEEP_TAGS_CSV}"

for app in "${VITRINE_APPS[@]}"; do
  repo="${GHCR_IMAGE_PREFIX}/vitrine-${app}"
  mapfile -t image_refs < <(docker images --format '{{.Repository}}:{{.Tag}}' "${repo}" 2>/dev/null || true)

  for ref in "${image_refs[@]}"; do
    [[ -z "${ref}" || "${ref}" == *"<none>"* ]] && continue
    tag="${ref##*:}"
    if [[ -n "${KEEP_TAGS[${tag}]+x}" ]]; then
      continue
    fi

    if docker rmi "${ref}" >/dev/null 2>&1; then
      echo "    removido ${ref}"
      removed_tags=$((removed_tags + 1))
    else
      skipped_in_use=$((skipped_in_use + 1))
    fi
  done
done

dangling_summary="$(docker image prune -f 2>&1 | tail -n 1 || true)"
echo "    image prune: ${dangling_summary:-nenhuma imagem dangling}"
echo "    tags vitrine removidos: ${removed_tags} (em uso / rollback: ${skipped_in_use})"
docker system df --format 'table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}' 2>/dev/null \
  || docker system df

exit 0
