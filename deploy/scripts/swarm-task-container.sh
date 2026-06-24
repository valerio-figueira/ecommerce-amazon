#!/usr/bin/env bash
# Resolve a running Swarm task container ID by service suffix (postgres, api, web, …).

resolve_running_task_container_id() {
  local service_suffix="$1"
  local stack_name="${STACK_NAME:-vitrine}"
  local service="${stack_name}_${service_suffix}"
  local task_id container_id

  task_id="$(docker service ps -q -f desired-state=running "${service}" | head -n1 || true)"
  if [[ -z "${task_id}" ]]; then
    return 1
  fi

  container_id="$(docker inspect --format '{{.Status.ContainerStatus.ContainerID}}' "${task_id}" 2>/dev/null || true)"
  if [[ -z "${container_id}" ]]; then
    return 1
  fi

  printf '%s' "${container_id}"
}
