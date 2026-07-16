#!/usr/bin/env bash
set -Eeuo pipefail

# Production uses absolute /opt marker paths. Keep this regression test inside
# a disposable Linux container so it can prove marker/compensation ordering.
[[ -f /.dockerenv ]] || {
  echo "This bootstrap compensation test must run in a disposable container" >&2
  exit 2
}

REPO_ROOT="${REPO_ROOT:-/repo}"
TARGET_COMMIT="$(printf 'c%.0s' {1..40})"
MARKER=/opt/resumesystem-rag-bootstrap-rollout.env
MOCK_LOG=/tmp/resumesystem-bootstrap-fixture-test.log
STDOUT_LOG=/tmp/resumesystem-bootstrap-fixture.stdout
STDERR_LOG=/tmp/resumesystem-bootstrap-fixture.stderr

rm -f -- "$MARKER" "$MOCK_LOG" "$STDOUT_LOG" "$STDERR_LOG"
mkdir -p /mock/bin

cat > /mock/bin/docker <<'EOF'
#!/usr/bin/env bash
set -u
printf '%s\n' "$*" >> /tmp/resumesystem-bootstrap-fixture-test.log

if [[ "${1:-}" == inspect ]]; then
  printf 'running\n'
  exit 0
fi
if [[ "${1:-}" == cp ]]; then
  exit 0
fi
if [[ "${1:-}" != exec ]]; then
  exit 0
fi

container="${2:-}"
args="$*"
if [[ "$container" == resume-mysql ]]; then
  case "$args" in
    *"SELECT CONCAT(id, '|'"*) exit 0 ;;
    *"SELECT COUNT(*) FROM knowledge_documents"*) printf '0\n'; exit 0 ;;
    *"INSERT INTO knowledge_documents"*) printf '42\n'; exit 0 ;;
    *"SELECT id FROM knowledge_documents"*) printf '42\n'; exit 0 ;;
    *"DELETE FROM knowledge_documents"*) exit 0 ;;
  esac
fi
if [[ "$container" == resume-agent && "$args" == *"bootstrap_fixture.py index"* ]]; then
  touch /tmp/resumesystem-bootstrap-index-failed
  printf 'simulated lightweight client failure\n' >&2
  exit 17
fi
if [[ "$container" == resume-agent && "$args" == *"bootstrap_fixture.py delete"* ]]; then
  printf 'fixture-delete\n' >> /tmp/resumesystem-bootstrap-fixture-test.log
  exit 0
fi
if [[ "$container" == resume-backend && "$args" == *"if [ -e"* ]]; then
  printf 'no\n'
  exit 0
fi
exit 0
EOF
cat > /mock/bin/rm <<'EOF'
#!/usr/bin/env bash
if [[ "${INJECT_MARKER_RM_FAILURE:-false}" == true \
  && -f /tmp/resumesystem-bootstrap-index-failed \
  && " $* " == *" /opt/resumesystem-rag-bootstrap-rollout.env "* ]]; then
  exit 1
fi
exec /bin/rm "$@"
EOF
cat > /mock/bin/sync <<'EOF'
#!/usr/bin/env bash
if [[ "${INJECT_MARKER_SYNC_FAILURE:-false}" == true \
  && -f /tmp/resumesystem-bootstrap-index-failed \
  && "${1:-}" == -f && "${2:-}" == /opt ]]; then
  exit 1
fi
exit 0
EOF
chmod 0755 /mock/bin/docker /mock/bin/rm /mock/bin/sync

set +e
PATH="/mock/bin:$PATH" RELEASE_COMMIT="$TARGET_COMMIT" \
  "$REPO_ROOT/deploy/bootstrap-rag-fixture.sh" --confirm "$TARGET_COMMIT" \
  >"$STDOUT_LOG" 2>"$STDERR_LOG"
status=$?
set -e

[[ "$status" -ne 0 ]] || {
  echo "Fixture bootstrap unexpectedly succeeded" >&2
  exit 1
}
[[ ! -e "$MARKER" ]] || {
  echo "Successful compensation left the bootstrap marker behind" >&2
  exit 1
}
[[ "$(grep -c '^fixture-delete$' "$MOCK_LOG")" -eq 1 ]] || {
  echo "Fixture compensation did not execute exactly once" >&2
  exit 1
}
grep -q 'DB row, vectors and file were compensated' "$STDERR_LOG"
if grep -q 'marker is missing or invalid\|compensation is incomplete' "$STDERR_LOG"; then
  echo "A command-substitution failure triggered duplicate compensation" >&2
  cat "$STDERR_LOG" >&2
  exit 1
fi

# A failed marker unlink must remain visibly recoverable and report an
# incomplete compensation instead of returning the original index error.
/bin/rm -f -- "$MARKER" /tmp/resumesystem-bootstrap-index-failed "$MOCK_LOG" \
  "$STDOUT_LOG" "$STDERR_LOG"
set +e
PATH="/mock/bin:$PATH" RELEASE_COMMIT="$TARGET_COMMIT" \
  INJECT_MARKER_RM_FAILURE=true \
  "$REPO_ROOT/deploy/bootstrap-rag-fixture.sh" --confirm "$TARGET_COMMIT" \
  >"$STDOUT_LOG" 2>"$STDERR_LOG"
rm_status=$?
set -e
[[ "$rm_status" -eq 75 && -f "$MARKER" ]]
grep -q 'marker deletion failed' "$STDERR_LOG"
grep -q 'compensation is incomplete' "$STDERR_LOG"

# If unlink succeeds but the /opt directory fsync fails, the current process
# sees no marker but must still fail closed; the rollout marker remains the
# recovery source of truth and a crash may safely replay the old marker.
/bin/rm -f -- "$MARKER" /tmp/resumesystem-bootstrap-index-failed "$MOCK_LOG" \
  "$STDOUT_LOG" "$STDERR_LOG"
set +e
PATH="/mock/bin:$PATH" RELEASE_COMMIT="$TARGET_COMMIT" \
  INJECT_MARKER_SYNC_FAILURE=true \
  "$REPO_ROOT/deploy/bootstrap-rag-fixture.sh" --confirm "$TARGET_COMMIT" \
  >"$STDOUT_LOG" 2>"$STDERR_LOG"
sync_status=$?
set -e
[[ "$sync_status" -eq 75 && ! -e "$MARKER" ]]
grep -q 'marker deletion was not durable' "$STDERR_LOG"
grep -q 'compensation is incomplete' "$STDERR_LOG"

echo "bootstrap-rag-fixture failure compensation: passed"
