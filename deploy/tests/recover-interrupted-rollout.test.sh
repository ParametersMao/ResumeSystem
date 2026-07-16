#!/usr/bin/env bash
set -Eeuo pipefail

# This test intentionally uses production's absolute /opt marker paths. Run it
# only in a disposable Linux container, never on a production host.
[[ -f /.dockerenv ]] || {
  echo "This recovery state-machine test must run in a disposable container" >&2
  exit 2
}

REPO_ROOT="${REPO_ROOT:-/repo}"
TEST_LOG=/tmp/resumesystem-recovery-test.log
TARGET_COMMIT="$(printf 'b%.0s' {1..40})"
PREVIOUS_COMMIT="$(printf 'a%.0s' {1..40})"
RUNTIME=/opt/resumesystem-runtime/deploy
PREVIOUS=/opt/resumesystem-previous
CANDIDATE=/opt/resumesystem-candidate
RESTORED=/opt/resumesystem-restored-test
BACKUP_ROOT=/opt/resumesystem-backups
TARGET_BACKUP="$BACKUP_ROOT/v1.3-target"
ROLLBACK_BACKUP="$BACKUP_ROOT/v1.3-rollback"
SAFETY_BACKUP="$BACKUP_ROOT/v1.3-safety"
ARTIFACT_ROOT=/opt/resumesystem-release-artifacts
ARTIFACT_MANIFEST="$ARTIFACT_ROOT/resumesystem-test-manifest.json"
ARTIFACT_CHECKSUMS="$ARTIFACT_ROOT/resumesystem-test-SHA256SUMS"
MARKER=/opt/resumesystem-rollout-in-progress.env
PENDING=/opt/resumesystem-release-pending.env

mkdir -p "$RUNTIME" "$PREVIOUS/deploy" "$CANDIDATE/deploy" "$RESTORED" \
  "$TARGET_BACKUP" "$ROLLBACK_BACKUP" "$SAFETY_BACKUP" "$ARTIFACT_ROOT" \
  /mock/bin /run/lock
printf 'RELEASE_COMMIT=%s\n' "$PREVIOUS_COMMIT" > "$PREVIOUS/.env"
printf 'services: {}\n' > "$PREVIOUS/docker-compose.prod.yml"
printf 'RELEASE_VERSION=1.3.4\n' > "$PREVIOUS/deploy/release-manifest.env"
printf 'RELEASE_COMMIT=%s\nRELEASE_ARTIFACT_MANIFEST=%s\nRELEASE_ARTIFACT_CHECKSUMS=%s\n' \
  "$TARGET_COMMIT" "$ARTIFACT_MANIFEST" "$ARTIFACT_CHECKSUMS" > "$CANDIDATE/.env"
chmod 0600 "$PREVIOUS/.env" "$CANDIDATE/.env"
printf 'services: {}\n' > "$CANDIDATE/docker-compose.prod.yml"
printf 'RELEASE_VERSION=1.3.4\nAGENT_VERSION=1.3.4\n' \
  > "$CANDIDATE/deploy/release-manifest.env"

make_backup() {
  local directory="$1"
  local commit="$2"
  printf '%s\n' "$commit" > "$directory/release-commit.txt"
  printf 'container\tconfigured_image\trunning_image\n' > "$directory/image-map.tsv"
  printf 'test-image-archive\n' > "$directory/docker-images.tar.gz"
  (
    cd "$directory"
    sha256sum release-commit.txt image-map.tsv docker-images.tar.gz > SHA256SUMS
  )
}
make_backup "$TARGET_BACKUP" "$TARGET_COMMIT"
make_backup "$ROLLBACK_BACKUP" "$PREVIOUS_COMMIT"
make_backup "$SAFETY_BACKUP" "$PREVIOUS_COMMIT"

cat > "$RUNTIME/maintenance-firewall.sh" <<'EOF'
maintenance_enable() { printf 'maintenance-enable\n' >> /tmp/resumesystem-recovery-test.log; }
maintenance_disable() { printf 'maintenance-disable\n' >> /tmp/resumesystem-recovery-test.log; }
EOF
cat > "$RUNTIME/recovery-acceptance.sh" <<'EOF'
#!/usr/bin/env bash
printf 'acceptance:%s\n' "${RAG_REQUIRED:-unset}" >> /tmp/resumesystem-recovery-test.log
EOF
cat > "$RUNTIME/rollback-images.sh" <<'EOF'
#!/usr/bin/env bash
[[ "${KEEP_TRAFFIC_CLOSED:-}" == true && "${1:-}" == --confirm && -d "${2:-}" ]]
printf 'rollback:%s\n' "$2" >> /tmp/resumesystem-recovery-test.log
EOF
cat > "$RUNTIME/restore.sh" <<'EOF'
#!/usr/bin/env bash
[[ "${1:-}" == --confirm && -d "${2:-}" \
  && "${3:-}" == --recover-interrupted \
  && "${4:-}" == /opt/resumesystem-rollout-in-progress.env ]]
printf 'data-recovery:%s\n' "$2" >> /tmp/resumesystem-recovery-test.log
rm -f /opt/resumesystem-rollout-in-progress.env /opt/resumesystem-release-pending.env
EOF
cat > "$CANDIDATE/deploy/bootstrap-rag-fixture.sh" <<'EOF'
#!/usr/bin/env bash
[[ "${1:-}" == --cleanup-created \
  && "${RELEASE_COMMIT:-}" == "${2:-}" ]]
printf 'fixture-cleanup:%s\n' "${2:-}" >> /tmp/resumesystem-recovery-test.log
rm -f /opt/resumesystem-rag-bootstrap-rollout.env
EOF
cat > /mock/bin/docker <<'EOF'
#!/usr/bin/env bash
printf 'docker:%s\n' "$*" >> /tmp/resumesystem-recovery-test.log
exit 0
EOF
cat > /mock/bin/systemctl <<'EOF'
#!/usr/bin/env bash
printf 'systemctl:%s\n' "$*" >> /tmp/resumesystem-recovery-test.log
exit 0
EOF
cat > /mock/bin/flock <<'EOF'
#!/usr/bin/env bash
[[ "${1:-}" == -n && "${2:-}" == 9 ]]
EOF
cat > /mock/bin/sync <<'EOF'
#!/usr/bin/env bash
if [[ "${FAIL_SYNC_WHEN_ROLLOUT_ONLY:-false}" == true \
  && -f /opt/resumesystem-rollout-in-progress.env \
  && ! -e /opt/resumesystem-release-pending.env ]]; then
  exit 1
fi
exit 0
EOF
chmod 0755 "$RUNTIME/recovery-acceptance.sh" "$RUNTIME/rollback-images.sh" \
  "$RUNTIME/restore.sh" "$CANDIDATE/deploy/bootstrap-rag-fixture.sh" \
  /mock/bin/docker /mock/bin/systemctl /mock/bin/flock /mock/bin/sync

for runtime_file in \
  recover-interrupted-rollout.sh \
  maintenance-firewall.sh \
  rollback-images.sh \
  recovery-acceptance.sh \
  rag-recovery-probe.py; do
  cp "$REPO_ROOT/deploy/$runtime_file" "$CANDIDATE/deploy/$runtime_file"
done
python3 - "$ARTIFACT_MANIFEST" "$CANDIDATE" "$TARGET_COMMIT" <<'PY'
import hashlib
import json
from pathlib import Path
import sys

manifest_path = Path(sys.argv[1])
release_root = Path(sys.argv[2])
commit = sys.argv[3]
runtime_files = {}
for relative in (
    "docker-compose.prod.yml",
    "deploy/release-manifest.env",
    "deploy/recover-interrupted-rollout.sh",
    "deploy/bootstrap-rag-fixture.sh",
    "deploy/maintenance-firewall.sh",
    "deploy/rollback-images.sh",
    "deploy/recovery-acceptance.sh",
    "deploy/rag-recovery-probe.py",
):
    runtime_files[relative] = hashlib.sha256((release_root / relative).read_bytes()).hexdigest()
manifest_path.write_text(
    json.dumps(
        {
            "releaseCommit": commit,
            "releaseVersion": "1.3.4",
            "runtimeFiles": runtime_files,
        },
        sort_keys=True,
    ),
    encoding="utf-8",
)
PY
(
  cd "$ARTIFACT_ROOT"
  sha256sum "$(basename "$ARTIFACT_MANIFEST")" > "$(basename "$ARTIFACT_CHECKSUMS")"
)
export PATH="/mock/bin:$PATH"

write_marker() {
  local operation="$1"
  local phase="$2"
  local state="${3:-in-progress}"
  local release_dir="${4:-unprepared}"
  local safety="${5:-unavailable}"
  local operation_backup="$TARGET_BACKUP"
  [[ "$operation" == deploy ]] && operation_backup="$ROLLBACK_BACKUP"
  umask 077
  printf 'ROLLOUT_STATE=%s\nROLLOUT_OPERATION=%s\nROLLOUT_PHASE=%s\nROLLOUT_RELEASE_COMMIT=%s\nROLLOUT_RELEASE_DIR=%s\nROLLOUT_PREVIOUS_RELEASE=%s\nROLLOUT_BACKUP_DIR=%s\nROLLOUT_SAFETY_BACKUP_DIR=%s\nROLLOUT_BACKUP_ROOT=%s\nROLLOUT_RECOVERY_RUNTIME_DIR=%s\nROLLOUT_HEALTH_TIMER_ENABLED=enabled\nROLLOUT_HEALTH_TIMER_ACTIVE=active\nROLLOUT_BACKUP_TIMER_ENABLED=disabled\nROLLOUT_BACKUP_TIMER_ACTIVE=inactive\nROLLOUT_STARTED_EPOCH=100\n' \
    "$state" "$operation" "$phase" "$TARGET_COMMIT" "$release_dir" \
    "$PREVIOUS" "$operation_backup" "$safety" "$BACKUP_ROOT" "$RUNTIME" \
    > "$MARKER"
}
run_recovery() {
  "$REPO_ROOT/deploy/recover-interrupted-rollout.sh" --confirm "$MARKER"
  [[ ! -e "$MARKER" && ! -e "$PENDING" ]]
}

: > "$TEST_LOG"
ln -sfn "$CANDIDATE" /opt/resumesystem-current

# An fsync failure after pending is removed must retain the complete rollout
# context, never recreate or strand pending by itself. A second recovery from
# that rollout-only state must remain idempotent.
write_marker deploy pending pending "$CANDIDATE"
printf 'PENDING_RELEASE_COMMIT=%s\nPENDING_DEPLOYED_EPOCH=100\n' \
  "$TARGET_COMMIT" > "$PENDING"
if FAIL_SYNC_WHEN_ROLLOUT_ONLY=true \
  "$REPO_ROOT/deploy/recover-interrupted-rollout.sh" --confirm "$MARKER"; then
  echo "Recovery unexpectedly passed the injected marker fsync failure" >&2
  exit 1
fi
[[ -f "$MARKER" && ! -e "$PENDING" ]]
run_recovery

ln -sfn "$CANDIDATE" /opt/resumesystem-current
write_marker deploy pending pending "$CANDIDATE"
printf 'PENDING_RELEASE_COMMIT=%s\nPENDING_DEPLOYED_EPOCH=100\n' \
  "$TARGET_COMMIT" > "$PENDING"
printf 'created\n' > /opt/resumesystem-rag-bootstrap-rollout.env
run_recovery
grep -Fxq "fixture-cleanup:$TARGET_COMMIT" "$TEST_LOG"
grep -Fxq "rollback:$ROLLBACK_BACKUP" "$TEST_LOG"
[[ "$(readlink -f /opt/resumesystem-current)" == "$PREVIOUS" ]]

write_marker restore pre-data in-progress unprepared "$SAFETY_BACKUP"
run_recovery
grep -Fxq "rollback:$SAFETY_BACKUP" "$TEST_LOG"

write_marker restore data-mutation in-progress "$RESTORED" "$SAFETY_BACKUP"
run_recovery
grep -Fxq "data-recovery:$SAFETY_BACKUP" "$TEST_LOG"

write_marker restore pre-safety
run_recovery
grep -Fxq 'acceptance:true' "$TEST_LOG"
grep -Fxq 'maintenance-disable' "$TEST_LOG"

echo "recover-interrupted-rollout.test: passed"
