#!/usr/bin/env bash

# Sourced by release/restore/rollback scripts. These rules block external
# HTTP(S) while preserving loopback acceptance probes against the proxy.
MAINTENANCE_RULE_COMMENT="resumesystem-maintenance"

maintenance_enable() {
  command -v iptables >/dev/null 2>&1 || {
    echo "iptables is required for fail-closed rollout" >&2
    return 1
  }
  local input_rule=(INPUT '!' -i lo -p tcp -m multiport --dports '80,443' -m comment --comment "$MAINTENANCE_RULE_COMMENT" -j REJECT)
  if ! iptables --wait -C "${input_rule[@]}" >/dev/null 2>&1; then
    iptables --wait -I "${input_rule[@]}"
  fi
  if iptables --wait -nL DOCKER-USER >/dev/null 2>&1; then
    local docker_rule=(DOCKER-USER '!' -i lo -p tcp -m multiport --dports '80,443' -m comment --comment "$MAINTENANCE_RULE_COMMENT" -j REJECT)
    if ! iptables --wait -C "${docker_rule[@]}" >/dev/null 2>&1; then
      iptables --wait -I "${docker_rule[@]}"
    fi
  fi
  export RESUMESYSTEM_MAINTENANCE_ACTIVE=true
}

maintenance_disable() {
  command -v iptables >/dev/null 2>&1 || return 1
  local input_rule=(INPUT '!' -i lo -p tcp -m multiport --dports '80,443' -m comment --comment "$MAINTENANCE_RULE_COMMENT" -j REJECT)
  while iptables --wait -C "${input_rule[@]}" >/dev/null 2>&1; do
    iptables --wait -D "${input_rule[@]}" || return 1
  done
  if iptables --wait -nL DOCKER-USER >/dev/null 2>&1; then
    local docker_rule=(DOCKER-USER '!' -i lo -p tcp -m multiport --dports '80,443' -m comment --comment "$MAINTENANCE_RULE_COMMENT" -j REJECT)
    while iptables --wait -C "${docker_rule[@]}" >/dev/null 2>&1; do
      iptables --wait -D "${docker_rule[@]}" || return 1
    done
  fi
  export RESUMESYSTEM_MAINTENANCE_ACTIVE=false
}
