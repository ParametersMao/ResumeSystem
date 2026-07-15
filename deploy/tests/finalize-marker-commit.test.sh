#!/usr/bin/env bash
set -Eeuo pipefail

# This test intentionally uses production's absolute /opt marker paths. Run it
# only in a disposable Linux container, never on a production host.
[[ -f /.dockerenv ]] || {
  echo "This finalization marker test must run in a disposable container" >&2
  exit 2
}

REPO_ROOT="${REPO_ROOT:-/repo}"
COMMIT="$(printf 'c%.0s' {1..40})"
RELEASE=/opt/resumesystem-finalize-candidate
PENDING=/opt/resumesystem-release-pending.env
ROLLOUT=/opt/resumesystem-rollout-in-progress.env
RAG_MARKER=/opt/resumesystem-rag-bootstrap-rollout.env
TEST_LOG=/tmp/resumesystem-finalize-marker-test.log

rm -rf -- "$RELEASE"
rm -f -- "$PENDING" "$ROLLOUT" "$RAG_MARKER"
rm -rf -- /mock/finalize-bin /tmp/resumesystem-finalize-systemctl
mkdir -p "$RELEASE/deploy" /mock/finalize-bin /tmp/resumesystem-finalize-systemctl /run/lock
printf 'RELEASE_COMMIT=%s\n' "$COMMIT" > "$RELEASE/.env"
printf 'services: {}\n' > "$RELEASE/docker-compose.prod.yml"
cat > "$RELEASE/deploy/maintenance-firewall.sh" <<'EOF'
maintenance_enable() { printf 'maintenance-enable\n' >> /tmp/resumesystem-finalize-marker-test.log; }
maintenance_disable() { printf 'maintenance-disable\n' >> /tmp/resumesystem-finalize-marker-test.log; }
EOF
for helper in recovery-acceptance.sh backup.sh health-check.sh; do
  cat > "$RELEASE/deploy/$helper" <<'EOF'
#!/usr/bin/env bash
exit 0
EOF
done
chmod 0755 "$RELEASE/deploy/"*.sh
ln -sfn "$RELEASE" /opt/resumesystem-current

cat > /mock/finalize-bin/docker <<'EOF'
#!/usr/bin/env bash
if [[ "${1:-}" == inspect ]]; then
  printf 'healthy\n'
fi
exit 0
EOF
cat > /mock/finalize-bin/flock <<'EOF'
#!/usr/bin/env bash
[[ "${1:-}" == -n && "${2:-}" == 9 ]]
EOF
cat > /mock/finalize-bin/install <<'EOF'
#!/usr/bin/env bash
exit 0
EOF
cat > /mock/finalize-bin/logger <<'EOF'
#!/usr/bin/env bash
exit 0
EOF
cat > /mock/finalize-bin/sync <<'EOF'
#!/usr/bin/env bash
if [[ "${FAIL_SYNC_WHEN_ROLLOUT_ONLY:-false}" == true \
  && -f /opt/resumesystem-rollout-in-progress.env \
  && ! -e /opt/resumesystem-release-pending.env ]]; then
  exit 1
fi
exit 0
EOF
cat > /mock/finalize-bin/systemctl <<'EOF'
#!/usr/bin/env bash
state_dir=/tmp/resumesystem-finalize-systemctl
command="${1:-}"
shift || true
case "$command" in
  disable)
    for argument in "$@"; do
      [[ "$argument" == --* ]] || : > "$state_dir/disabled-$argument"
    done
    ;;
  enable)
    for argument in "$@"; do
      [[ "$argument" == --* ]] || rm -f -- "$state_dir/disabled-$argument"
    done
    ;;
  is-enabled)
    unit="${*: -1}"
    [[ ! -f "$state_dir/disabled-$unit" ]]
    ;;
  is-active) exit 0 ;;
  *) exit 0 ;;
esac
EOF
chmod 0755 /mock/finalize-bin/*
export PATH="/mock/finalize-bin:$PATH"

write_markers() {
  local epoch=$(( $(date +%s) - 1000 ))
  umask 077
  printf 'PENDING_RELEASE_COMMIT=%s\nPENDING_DEPLOYED_EPOCH=%s\n' \
    "$COMMIT" "$epoch" > "$PENDING"
  printf 'ROLLOUT_STATE=pending\nROLLOUT_OPERATION=deploy\nROLLOUT_PHASE=pending\nROLLOUT_RELEASE_COMMIT=%s\n' \
    "$COMMIT" > "$ROLLOUT"
  printf 'RAG_BOOTSTRAP_STATE=created\nRAG_BOOTSTRAP_RELEASE_COMMIT=%s\nRAG_BOOTSTRAP_DOCUMENT_ID=1\n' \
    "$COMMIT" > "$RAG_MARKER"
}

: > "$TEST_LOG"
write_markers
if FAIL_SYNC_WHEN_ROLLOUT_ONLY=true \
  "$REPO_ROOT/deploy/finalize-release.sh" --confirm "$COMMIT"; then
  echo "Finalization unexpectedly passed the injected marker fsync failure" >&2
  exit 1
fi
[[ -f "$ROLLOUT" && ! -e "$PENDING" && ! -e "$RAG_MARKER" ]]
grep -Fxq maintenance-enable "$TEST_LOG"

# The verified terminal path is idempotent once a valid pending marker is
# supplied again: pending disappears first and rollout is committed last.
write_markers
"$REPO_ROOT/deploy/finalize-release.sh" --confirm "$COMMIT"
[[ ! -e "$PENDING" && ! -e "$ROLLOUT" && ! -e "$RAG_MARKER" ]]

echo "finalize-marker-commit.test: passed"
