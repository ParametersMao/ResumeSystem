#!/usr/bin/env bash
set -Eeuo pipefail

[[ -f /.dockerenv ]] || {
  echo "This backup recovery test must run in a disposable container" >&2
  exit 2
}

REPO_ROOT="${REPO_ROOT:-/repo}"
COMMIT="$(printf 'c%.0s' {1..40})"
RELEASE=/opt/resumesystem-backup-test
RUNTIME="$RELEASE/deploy"
MARKER=/opt/resumesystem-backup-freeze.env
LOG=/tmp/resumesystem-backup-recovery.log
mkdir -p "$RUNTIME" /mock/bin /run/lock
ln -s "$RELEASE" /opt/resumesystem-current
printf 'RELEASE_COMMIT=%s\n' "$COMMIT" > "$RELEASE/.env"
printf 'services: {}\n' > "$RELEASE/docker-compose.prod.yml"

cat > "$RUNTIME/maintenance-firewall.sh" <<'EOF'
maintenance_enable() { echo maintenance_enable >> /tmp/resumesystem-backup-recovery.log; }
maintenance_disable() { echo maintenance_disable >> /tmp/resumesystem-backup-recovery.log; }
EOF
cat > "$RUNTIME/recovery-acceptance.sh" <<'EOF'
#!/usr/bin/env bash
echo recovery_acceptance >> /tmp/resumesystem-backup-recovery.log
[[ "${INJECT_ACCEPTANCE_FAILURE:-false}" != true ]]
EOF
chmod 755 "$RUNTIME/recovery-acceptance.sh"

cat > /mock/bin/docker <<'EOF'
#!/usr/bin/env bash
echo "docker $*" >> /tmp/resumesystem-backup-recovery.log
if [[ "${1:-}" == compose && "${2:-}" == version ]]; then exit 0; fi
if [[ "${1:-}" == inspect ]]; then echo healthy; fi
exit 0
EOF
cat > /mock/bin/flock <<'EOF'
#!/usr/bin/env bash
exit 0
EOF
cat > /mock/bin/rm <<'EOF'
#!/usr/bin/env bash
if [[ "${INJECT_RM_HUP:-false}" == true && "$*" == *resumesystem-backup-freeze.env* ]]; then
  kill -HUP "$PPID"
  sleep 1
  exit 1
fi
exec /bin/rm "$@"
EOF
cat > /mock/bin/sync <<'EOF'
#!/usr/bin/env bash
if [[ "${INJECT_DIR_SYNC_FAILURE:-false}" == true && "$*" == '-f /opt' ]]; then
  exit 1
fi
exec /usr/bin/sync "$@"
EOF
chmod 755 /mock/bin/*

write_marker() {
  local keep_proxy="$1"
  cat > "$MARKER" <<EOF
BACKUP_RELEASE_COMMIT=$COMMIT
BACKUP_RELEASE_DIR=$RELEASE
BACKUP_RECOVERY_RUNTIME_DIR=$RUNTIME
BACKUP_KEEP_PROXY_STOPPED=$keep_proxy
BACKUP_RAG_REQUIRED=true
BACKUP_STARTED_EPOCH=1700000000
EOF
  chmod 600 "$MARKER"
}
run_recovery() {
  PATH="/mock/bin:$PATH" \
    "$REPO_ROOT/deploy/recover-interrupted-backup.sh" --confirm "$MARKER"
}

: > "$LOG"
write_marker false
run_recovery
[[ ! -e "$MARKER" ]]
grep -Fxq maintenance_disable "$LOG"
grep -Fxq recovery_acceptance "$LOG"
grep -Fq -- '--force-recreate reverse-proxy' "$LOG"

# Acceptance failure is fail-closed and leaves the marker for a retry.
: > "$LOG"
write_marker false
set +e
INJECT_ACCEPTANCE_FAILURE=true run_recovery >/dev/null 2>&1
status=$?
set -e
[[ "$status" -ne 0 && -f "$MARKER" ]]
grep -Fq 'stop reverse-proxy' "$LOG"
if grep -Fxq maintenance_disable "$LOG"; then
  echo "Failed acceptance unexpectedly reopened traffic" >&2
  exit 1
fi
run_recovery >/dev/null
[[ ! -e "$MARKER" ]]

# An fsync error after a successful unlink must not manufacture a false
# recovery failure and an unmarked outage.
: > "$LOG"
write_marker false
INJECT_DIR_SYNC_FAILURE=true run_recovery >/dev/null
[[ ! -e "$MARKER" ]]
grep -Fxq maintenance_disable "$LOG"

# Inject HUP after the verified stack has reopened but before marker unlink.
# Signal traps are deliberately disabled at that terminal boundary: traffic
# stays healthy and the durable marker remains safely retryable.
: > "$LOG"
write_marker false
set +e
INJECT_RM_HUP=true run_recovery >/dev/null 2>&1
status=$?
set -e
[[ "$status" -ne 0 && -f "$MARKER" ]]
grep -Fxq maintenance_disable "$LOG"
if grep -Fq 'stop reverse-proxy' "$LOG"; then
  echo "Terminal HUP incorrectly re-closed verified traffic" >&2
  exit 1
fi
run_recovery >/dev/null
[[ ! -e "$MARKER" ]]

: > "$LOG"
touch /opt/resumesystem-rollout-in-progress.env
write_marker true
run_recovery
[[ ! -e "$MARKER" ]]
grep -Fq 'stop reverse-proxy' "$LOG"
if grep -Fxq maintenance_disable "$LOG"; then
  echo "Enclosing rollout backup unexpectedly reopened traffic" >&2
  exit 1
fi

echo "recover-interrupted-backup.test: passed"
