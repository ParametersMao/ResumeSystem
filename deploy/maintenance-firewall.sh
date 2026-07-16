#!/usr/bin/env bash

# Sourced by release/restore/rollback scripts. These rules block external
# HTTP(S) while preserving loopback acceptance probes against the proxy.
MAINTENANCE_RULE_COMMENT="resumesystem-maintenance"

maintenance_delete_commented_rules() {
  local chain="$1"
  local rule_number
  local rules

  while true; do
    rules="$(iptables --wait -S "$chain" 2>/dev/null)" || return 1
    rule_number="$(awk -v marker="$MAINTENANCE_RULE_COMMENT" '
          $1 == "-A" { rule_number += 1 }
          $1 == "-A" && index($0, marker) { print rule_number; exit }
        ' <<< "$rules")" || return 1
    [[ -n "$rule_number" ]] || break
    [[ "$rule_number" =~ ^[1-9][0-9]*$ ]] || {
      echo "Invalid maintenance rule number for $chain: $rule_number" >&2
      return 1
    }
    iptables --wait -D "$chain" "$rule_number" || return 1
  done
}

maintenance_external_interfaces() {
  command -v ip >/dev/null 2>&1 || {
    echo "ip is required to identify external ingress interfaces" >&2
    return 1
  }
  ip -o -4 route show default 2>/dev/null \
    | awk '{ for (i = 1; i <= NF; i += 1) if ($i == "dev" && i < NF) print $(i + 1) }' \
    | sort -u
}

maintenance_enable() {
  command -v iptables >/dev/null 2>&1 || {
    echo "iptables is required for fail-closed rollout" >&2
    return 1
  }
  local -a external_interfaces=()
  iptables --wait -nL DOCKER-USER >/dev/null 2>&1 || {
    echo "DOCKER-USER is required to fail-close published container ports" >&2
    return 1
  }
  mapfile -t external_interfaces < <(maintenance_external_interfaces)
  ((${#external_interfaces[@]} > 0)) || {
    echo "No default IPv4 ingress interface found for Docker maintenance rules" >&2
    return 1
  }

  local input_rule=(INPUT '!' -i lo -p tcp -m multiport --dports '80,443' -m comment --comment "$MAINTENANCE_RULE_COMMENT" -j REJECT)
  if ! iptables --wait -C "${input_rule[@]}" >/dev/null 2>&1; then
    iptables --wait -I "${input_rule[@]}" || return 1
  fi

  local external_interface
  local -a docker_rule
  for external_interface in "${external_interfaces[@]}"; do
    docker_rule=(DOCKER-USER -i "$external_interface" -p tcp -m multiport --dports '80,443' -m comment --comment "$MAINTENANCE_RULE_COMMENT" -j REJECT)
    if ! iptables --wait -C "${docker_rule[@]}" >/dev/null 2>&1; then
      iptables --wait -I "${docker_rule[@]}" || return 1
    fi
  done

  if ! iptables --wait -C FORWARD -j DOCKER-USER >/dev/null 2>&1; then
    iptables --wait -I FORWARD 1 -j DOCKER-USER || return 1
  fi
  iptables --wait -C FORWARD -j DOCKER-USER >/dev/null 2>&1 || return 1

  # v1.3.4 originally used this broad rule. It also matched Docker bridge
  # ingress and therefore rejected reverse-proxy -> Web/Admin traffic. Add
  # the external-interface rules first, then safely remove every old copy.
  local legacy_docker_rule=(DOCKER-USER '!' -i lo -p tcp -m multiport --dports '80,443' -m comment --comment "$MAINTENANCE_RULE_COMMENT" -j REJECT)
  while iptables --wait -C "${legacy_docker_rule[@]}" >/dev/null 2>&1; do
    iptables --wait -D "${legacy_docker_rule[@]}" || return 1
  done
  export RESUMESYSTEM_MAINTENANCE_ACTIVE=true
}

maintenance_disable() {
  command -v iptables >/dev/null 2>&1 || return 1
  maintenance_delete_commented_rules INPUT || return 1
  if iptables --wait -nL DOCKER-USER >/dev/null 2>&1; then
    maintenance_delete_commented_rules DOCKER-USER || return 1
  fi
  export RESUMESYSTEM_MAINTENANCE_ACTIVE=false
}
