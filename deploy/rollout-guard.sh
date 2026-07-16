#!/usr/bin/env bash
set -euo pipefail

MODE="${1:---firewall-only}"
ROLLOUT_MARKER="${ROLLOUT_MARKER:-/opt/resumesystem-rollout-in-progress.env}"
PENDING_FILE="${PENDING_FILE:-/opt/resumesystem-release-pending.env}"
BACKUP_FREEZE_MARKER="${BACKUP_FREEZE_MARKER:-/opt/resumesystem-backup-freeze.env}"
RULE_COMMENT="resumesystem-maintenance"

case "$MODE" in
  --firewall-only|--stop-proxy) ;;
  *)
    echo "Usage: $0 [--firewall-only|--stop-proxy]" >&2
    exit 2
    ;;
esac

# No marker means the last rollout was finalized. The services are intentionally
# no-ops on ordinary boots.
if [[ ! -f "$ROLLOUT_MARKER" && ! -f "$PENDING_FILE" \
  && ! -f "$BACKUP_FREEZE_MARKER" ]]; then
  exit 0
fi

command -v iptables >/dev/null 2>&1 || {
  echo "iptables is required to guard an incomplete ResumeSystem rollout" >&2
  exit 1
}
command -v ip >/dev/null 2>&1 || {
  echo "ip is required to identify external ingress interfaces" >&2
  exit 1
}
mapfile -t external_interfaces < <(
  ip -o -4 route show default 2>/dev/null \
    | awk '{ for (i = 1; i <= NF; i += 1) if ($i == "dev" && i < NF) print $(i + 1) }' \
    | sort -u
)
((${#external_interfaces[@]} > 0)) || {
  echo "No default IPv4 ingress interface found for rollout guard" >&2
  exit 1
}

input_rule=(INPUT '!' -i lo -p tcp -m multiport --dports '80,443' -m comment --comment "$RULE_COMMENT" -j REJECT)
if ! iptables --wait -C "${input_rule[@]}" >/dev/null 2>&1; then
  iptables --wait -I "${input_rule[@]}"
fi

# The early unit runs before Docker. Pre-create Docker's documented user chain
# and hook it into FORWARD so published container ports stay closed from the
# first packet. Docker preserves DOCKER-USER rules when it starts.
if ! iptables --wait -nL DOCKER-USER >/dev/null 2>&1; then
  iptables --wait -N DOCKER-USER
fi
if ! iptables --wait -C FORWARD -j DOCKER-USER >/dev/null 2>&1; then
  iptables --wait -I FORWARD 1 -j DOCKER-USER
fi
for external_interface in "${external_interfaces[@]}"; do
  docker_rule=(DOCKER-USER -i "$external_interface" -p tcp -m multiport --dports '80,443' -m comment --comment "$RULE_COMMENT" -j REJECT)
  if ! iptables --wait -C "${docker_rule[@]}" >/dev/null 2>&1; then
    iptables --wait -I "${docker_rule[@]}"
  fi
done

# Remove the pre-fix rule only after every current external-interface rule is
# installed. The old negated-loopback match also rejected Docker bridge
# traffic, preventing reverse-proxy from reaching Web/Admin.
legacy_docker_rule=(DOCKER-USER '!' -i lo -p tcp -m multiport --dports '80,443' -m comment --comment "$RULE_COMMENT" -j REJECT)
while iptables --wait -C "${legacy_docker_rule[@]}" >/dev/null 2>&1; do
  iptables --wait -D "${legacy_docker_rule[@]}"
done

if [[ "$MODE" == "--stop-proxy" ]] \
  && command -v docker >/dev/null 2>&1 \
  && docker info >/dev/null 2>&1; then
  docker stop --time 10 resume-proxy >/dev/null 2>&1 || true
fi

logger -t resumesystem-rollout-guard \
  "Incomplete rollout or backup freeze detected; public HTTP(S) remains fail-closed (mode=$MODE)"
