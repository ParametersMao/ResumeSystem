#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="${REPO_ROOT:-/repo}"
TEST_ROOT="$(mktemp -d)"
STATE="$TEST_ROOT/iptables.state"
LOG="$TEST_ROOT/iptables.log"
trap 'rm -rf "$TEST_ROOT"' EXIT
mkdir -p "$TEST_ROOT/bin"
: > "$STATE"
: > "$LOG"

cat > "$TEST_ROOT/bin/ip" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ "${NO_DEFAULT_ROUTE:-false}" != true \
  && "$*" == "-o -4 route show default" ]]; then
  printf 'default via 10.0.0.1 dev eth0 proto dhcp\n'
fi
EOF

cat > "$TEST_ROOT/bin/iptables" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
state="${IPTABLES_TEST_STATE:?}"
log="${IPTABLES_TEST_LOG:?}"
printf '%s\n' "$*" >> "$log"
[[ "${1:-}" == --wait ]] && shift

case "${1:-}" in
  -nL)
    [[ "${2:-}" == DOCKER-USER && "${NO_DOCKER_USER:-false}" != true ]]
    ;;
  -S)
    chain="${2:?}"
    [[ "${FAIL_IPTABLES_LIST_CHAIN:-}" != "$chain" ]] || exit 1
    awk -F '|' -v chain="$chain" '$1 == chain { sub(/^[^|]*\|/, ""); print "-A " chain " " $0 }' "$state"
    ;;
  -C)
    shift
    chain="${1:?}"
    shift
    grep -Fxq -- "$chain|$*" "$state"
    ;;
  -I)
    shift
    chain="${1:?}"
    shift
    [[ "${FAIL_IPTABLES_INSERT_CHAIN:-}" != "$chain" ]] || exit 1
    [[ "${1:-}" =~ ^[1-9][0-9]*$ ]] && shift
    printf '%s|%s\n' "$chain" "$*" >> "$state"
    ;;
  -N)
    [[ "${2:-}" == DOCKER-USER ]]
    ;;
  -D)
    shift
    chain="${1:?}"
    shift
    if [[ "$#" == 1 && "${1:-}" =~ ^[1-9][0-9]*$ ]]; then
      wanted="$1"
      awk -F '|' -v chain="$chain" -v wanted="$wanted" '
        BEGIN { seen = 0 }
        $1 == chain { seen += 1 }
        !($1 == chain && seen == wanted) { print }
      ' "$state" > "$state.next"
      mv "$state.next" "$state"
    else
      exact="$chain|$*"
      awk -v exact="$exact" '$0 != exact { print }' "$state" > "$state.next"
      mv "$state.next" "$state"
    fi
    ;;
  *)
    echo "Unexpected iptables invocation: $*" >&2
    exit 2
    ;;
esac
EOF
cat > "$TEST_ROOT/bin/logger" <<'EOF'
#!/usr/bin/env bash
exit 0
EOF
chmod 0755 "$TEST_ROOT/bin/ip" "$TEST_ROOT/bin/iptables" "$TEST_ROOT/bin/logger"

export PATH="$TEST_ROOT/bin:$PATH"
export IPTABLES_TEST_STATE="$STATE"
export IPTABLES_TEST_LOG="$LOG"
# shellcheck disable=SC1091
source "$REPO_ROOT/deploy/maintenance-firewall.sh"

rule_tail='-p tcp -m multiport --dports 80,443 -m comment --comment resumesystem-maintenance -j REJECT'
printf 'INPUT|! -i lo %s\n' "$rule_tail" >> "$STATE"
printf 'DOCKER-USER|! -i lo %s\n' "$rule_tail" >> "$STATE"

maintenance_enable
grep -Fxq "DOCKER-USER|-i eth0 $rule_tail" "$STATE"
grep -Fxq 'FORWARD|-j DOCKER-USER' "$STATE"
if grep -Fq 'DOCKER-USER|! -i lo' "$STATE"; then
  echo "Broad DOCKER-USER maintenance rule was not removed" >&2
  exit 1
fi
[[ "$(grep -Fxc "DOCKER-USER|-i eth0 $rule_tail" "$STATE")" == 1 ]]

# Enabling again is idempotent and never creates a bridge-wide rule.
maintenance_enable
[[ "$(grep -Fxc "DOCKER-USER|-i eth0 $rule_tail" "$STATE")" == 1 ]]
[[ "$(grep -Fxc 'FORWARD|-j DOCKER-USER' "$STATE")" == 1 ]]
if grep -Eq 'DOCKER-USER\|(! -i lo|-i (docker|br-))' "$STATE"; then
  echo "Maintenance rule can still match Docker bridge ingress" >&2
  exit 1
fi

# Disable removes current and stale comment-tagged rules by rule number.
printf 'DOCKER-USER|-i old0 %s\n' "$rule_tail" >> "$STATE"
if FAIL_IPTABLES_LIST_CHAIN=INPUT maintenance_disable >/dev/null 2>&1; then
  echo "Maintenance disable hid a failed iptables rule listing" >&2
  exit 1
fi
[[ "${RESUMESYSTEM_MAINTENANCE_ACTIVE:-false}" == true ]]
grep -Fq 'resumesystem-maintenance' "$STATE"
maintenance_disable
if grep -Fq 'resumesystem-maintenance' "$STATE"; then
  echo "Maintenance disable left comment-tagged rules behind" >&2
  exit 1
fi

# If Docker forwarding exists but no default IPv4 route can be identified,
# fail before installing a partial INPUT-only maintenance state.
: > "$STATE"
if NO_DEFAULT_ROUTE=true maintenance_enable >/dev/null 2>&1; then
  echo "Maintenance enable unexpectedly accepted a missing default route" >&2
  exit 1
fi
[[ ! -s "$STATE" ]]

# Published container ports cannot be declared fail-closed without Docker's
# user chain; reject that state before installing only the INPUT half.
if NO_DOCKER_USER=true maintenance_enable >/dev/null 2>&1; then
  echo "Maintenance enable unexpectedly accepted a missing DOCKER-USER chain" >&2
  exit 1
fi
[[ ! -s "$STATE" ]]

# A failed Docker rule insertion must propagate even when the function is
# called from an OR-list where Bash would otherwise suppress errexit.
if FAIL_IPTABLES_INSERT_CHAIN=DOCKER-USER maintenance_enable >/dev/null 2>&1; then
  echo "Maintenance enable hid a failed Docker rule insertion" >&2
  exit 1
fi
[[ "${RESUMESYSTEM_MAINTENANCE_ACTIVE:-false}" != true ]]
maintenance_disable
[[ ! -s "$STATE" ]]

# The boot guard must enforce the same external-interface scope; otherwise a
# reboot with any durable marker would recreate the bridge-wide outage.
marker="$TEST_ROOT/rollout.env"
touch "$marker"
ROLLOUT_MARKER="$marker" \
PENDING_FILE="$TEST_ROOT/pending.env" \
BACKUP_FREEZE_MARKER="$TEST_ROOT/freeze.env" \
NO_DOCKER_USER=true \
  "$REPO_ROOT/deploy/rollout-guard.sh" --firewall-only
grep -Fxq "DOCKER-USER|-i eth0 $rule_tail" "$STATE"
grep -Fxq 'FORWARD|-j DOCKER-USER' "$STATE"
grep -Fq -- '--wait -N DOCKER-USER' "$LOG"
if grep -Fq 'DOCKER-USER|! -i lo' "$STATE"; then
  echo "Boot guard installed a bridge-wide Docker maintenance rule" >&2
  exit 1
fi
grep -Fxq 'Wants=network-online.target' \
  "$REPO_ROOT/deploy/systemd/resumesystem-rollout-guard.service"
grep -Fxq 'After=local-fs.target network-online.target' \
  "$REPO_ROOT/deploy/systemd/resumesystem-rollout-guard.service"

# No durable marker means the guard is a strict no-op.
: > "$STATE"
rm -f "$marker"
ROLLOUT_MARKER="$marker" \
PENDING_FILE="$TEST_ROOT/pending.env" \
BACKUP_FREEZE_MARKER="$TEST_ROOT/freeze.env" \
  "$REPO_ROOT/deploy/rollout-guard.sh" --firewall-only
[[ ! -s "$STATE" ]]

echo "maintenance-firewall.test: passed"
