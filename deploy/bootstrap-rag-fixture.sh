#!/usr/bin/env bash
# Do not enable errtrace here. Several mutation commands use command
# substitution; inheriting ERR into that subshell can commit compensation
# there and then invoke the parent ERR trap a second time with no marker left.
# The parent shell observes the failed assignment and owns the one cleanup.
set -euo pipefail

MODE=""
CONFIRMED_COMMIT="${2:-}"
if [[ "${1:-}" == "--confirm" && "$CONFIRMED_COMMIT" =~ ^[0-9a-f]{40}$ && $# -eq 2 ]]; then
  MODE="bootstrap"
elif [[ "${1:-}" == "--cleanup-created" \
  && "$CONFIRMED_COMMIT" =~ ^[0-9a-f]{40}$ && $# -eq 2 ]]; then
  MODE="cleanup"
else
  echo "Usage: $0 --confirm <full-release-commit> | --cleanup-created <full-release-commit>" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
RELEASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd -P)"
SEED_FILE="$RELEASE_DIR/docs/knowledge-base/resume-writing-standard-v1.md"
BOOTSTRAP_MARKER="${RAG_BOOTSTRAP_MARKER:-/opt/resumesystem-rag-bootstrap-rollout.env}"

[[ -f "$RELEASE_DIR/deploy/release-manifest.env" && -f "$SEED_FILE" ]] || {
  echo "Release manifest or canonical RAG fixture is missing" >&2
  exit 1
}
command -v timeout >/dev/null 2>&1 || {
  echo "GNU timeout is required for bounded RAG fixture requests" >&2
  exit 1
}
manifest_cr_status=0
LC_ALL=C grep -q $'\r' "$RELEASE_DIR/deploy/release-manifest.env" || manifest_cr_status=$?
case "$manifest_cr_status" in
  0)
    echo "Release manifest must use LF line endings and match the Git blob" >&2
    exit 1
    ;;
  1) ;;
  *)
    echo "Release manifest line endings could not be validated" >&2
    exit 1
    ;;
esac
# shellcheck disable=SC1091
source "$RELEASE_DIR/deploy/release-manifest.env"
[[ "${RELEASE_COMMIT:-}" == "$CONFIRMED_COMMIT" ]] || {
  echo "RAG fixture confirmation does not match the immutable release" >&2
  exit 1
}
for container in resume-mysql resume-backend resume-agent; do
  [[ "$(docker inspect "$container" --format '{{.State.Status}}' 2>/dev/null || true)" == "running" ]] || {
    echo "$container must be running before RAG fixture bootstrap" >&2
    exit 1
  }
done

storage_key="knowledge/global/bootstrap/${RELEASE_COMMIT}/resume-writing-standard-v1.md"
storage_url="/uploads/${storage_key}"
agent_fixture_path="/tmp/resume-writing-standard-v1.md"

mysql_query() {
  docker exec resume-mysql sh -c \
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --connect-timeout=10 -N -B -uroot "$MYSQL_DATABASE" -e "$1"' \
    sh "$1"
}

persist_bootstrap_marker() {
  local state="$1"
  local document_id="$2"
  local marker_temp
  [[ "$state" == "prepared" || "$state" == "created" ]] || return 1
  [[ "$document_id" =~ ^(0|[1-9][0-9]*)$ ]] || return 1
  umask 077
  marker_temp="$(mktemp /opt/.resumesystem-rag-bootstrap.XXXXXX)"
  printf 'RAG_BOOTSTRAP_STATE=%s\nRAG_BOOTSTRAP_RELEASE_COMMIT=%s\nRAG_BOOTSTRAP_DOCUMENT_ID=%s\n' \
    "$state" "$RELEASE_COMMIT" "$document_id" > "$marker_temp"
  sync -f "$marker_temp"
  mv -Tf "$marker_temp" "$BOOTSTRAP_MARKER"
  sync -f "$(dirname "$BOOTSTRAP_MARKER")"
}

read_valid_marker() {
  [[ -f "$BOOTSTRAP_MARKER" ]] || return 1
  marker_state="$(awk -F= '$1 == "RAG_BOOTSTRAP_STATE" {print $2}' "$BOOTSTRAP_MARKER")"
  marker_commit="$(awk -F= '$1 == "RAG_BOOTSTRAP_RELEASE_COMMIT" {print $2}' "$BOOTSTRAP_MARKER")"
  marker_document_id="$(awk -F= '$1 == "RAG_BOOTSTRAP_DOCUMENT_ID" {print $2}' "$BOOTSTRAP_MARKER")"
  [[ "$marker_state" == "prepared" || "$marker_state" == "created" ]] \
    && [[ "$marker_commit" == "$RELEASE_COMMIT" ]] \
    && [[ "$marker_document_id" =~ ^(0|[1-9][0-9]*)$ ]]
}

cleanup_release_fixture() {
  local cleanup_status=0
  local db_ids=""
  local current_id=""
  local remaining_count=""
  local file_still_exists=""

  if ! read_valid_marker; then
    echo "RAG bootstrap marker is missing or invalid; refusing an unbound cleanup" >&2
    return 1
  fi

  db_ids="$(mysql_query \
    "SELECT id FROM knowledge_documents WHERE storage_key='${storage_key}' ORDER BY id;" \
    2>/dev/null)" || cleanup_status=1
  while IFS= read -r current_id; do
    [[ -n "$current_id" ]] || continue
    if [[ ! "$current_id" =~ ^[1-9][0-9]*$ ]]; then
      cleanup_status=1
      continue
    fi
    timeout --signal=TERM --kill-after=10s 210s \
      docker exec resume-agent python scripts/bootstrap_fixture.py delete \
      "$current_id" >/dev/null 2>&1 || cleanup_status=1
  done <<< "$db_ids"
  if [[ "$marker_document_id" =~ ^[1-9][0-9]*$ ]] \
    && ! grep -Fxq "$marker_document_id" <<< "$db_ids"; then
    timeout --signal=TERM --kill-after=10s 210s \
      docker exec resume-agent python scripts/bootstrap_fixture.py delete \
      "$marker_document_id" >/dev/null 2>&1 || cleanup_status=1
  fi

  mysql_query \
    "DELETE FROM knowledge_documents WHERE storage_key='${storage_key}';" \
    >/dev/null 2>&1 || cleanup_status=1
  remaining_count="$(mysql_query \
    "SELECT COUNT(*) FROM knowledge_documents WHERE storage_key='${storage_key}';" \
    2>/dev/null)" || cleanup_status=1
  [[ "$remaining_count" == "0" ]] || cleanup_status=1

  docker exec resume-backend rm -f "/app/uploads/$storage_key" \
    "/app/uploads/${storage_key}.new" >/dev/null 2>&1 \
    || cleanup_status=1
  file_still_exists="$(docker exec resume-backend sh -c \
    'if [ -e "$1" ] || [ -e "$2" ]; then echo yes; else echo no; fi' sh \
    "/app/uploads/$storage_key" "/app/uploads/${storage_key}.new" \
    2>/dev/null)" || cleanup_status=1
  [[ "$file_still_exists" == "no" ]] || cleanup_status=1
  docker exec resume-agent rm -f "$agent_fixture_path" >/dev/null 2>&1 \
    || cleanup_status=1

  if [[ "$cleanup_status" -eq 0 ]]; then
    if ! rm -f -- "$BOOTSTRAP_MARKER"; then
      echo "RAG fixture cleanup passed but marker deletion failed" >&2
      return 1
    fi
    if ! sync -f "$(dirname "$BOOTSTRAP_MARKER")"; then
      echo "RAG fixture cleanup passed but marker deletion was not durable" >&2
      return 1
    fi
    return 0
  fi
  echo "RAG fixture cleanup is incomplete; durable marker retained" >&2
  return 1
}

if [[ "$MODE" == "cleanup" ]]; then
  cleanup_release_fixture
  echo "CLEANED|${RELEASE_COMMIT}|${storage_key}"
  exit 0
fi

[[ ! -e "$BOOTSTRAP_MARKER" ]] || {
  echo "An interrupted RAG fixture bootstrap must be recovered before retrying" >&2
  exit 1
}

copy_fixture_to_backend() {
  local storage_directory
  storage_directory="$(dirname "$storage_key")"
  docker exec resume-backend mkdir -p "/app/uploads/$storage_directory"
  docker cp "$SEED_FILE" "resume-backend:/app/uploads/${storage_key}.new"
  docker exec resume-backend mv -f \
    "/app/uploads/${storage_key}.new" "/app/uploads/$storage_key"
}

probe_fixture() {
  local document_id="$1"
  local chunk_count="$2"
  local expected_source_sha256="$3"
  local probe
  probe="$(docker exec resume-agent python scripts/health_probe_client.py \
    "$document_id" "$chunk_count" 60 2>/dev/null || true)"
  [[ "$probe" == "OK|${document_id}|${chunk_count}|${expected_source_sha256}|"* ]]
}

# Reuse only when MySQL, Qdrant and the immutable source file all describe the
# exact same fixture. Never overwrite an old storage key without reindexing it.
seed_sha256="$(sha256sum "$SEED_FILE" | awk '{print $1}')"
existing_fixture="$(mysql_query \
  "SELECT CONCAT(id, '|', chunk_count, '|', storage_key) FROM knowledge_documents WHERE enabled=1 AND status='ready' AND source_type='standard' AND scope='global' AND chunk_count>0 AND storage_key LIKE 'knowledge/global/bootstrap/%/resume-writing-standard-v1.md' ORDER BY id DESC LIMIT 1;" \
  2>/dev/null || true)"
if [[ "$existing_fixture" =~ ^([1-9][0-9]*)\|([1-9][0-9]*)\|(knowledge/global/bootstrap/[0-9a-f]{40}/resume-writing-standard-v1[.]md)$ ]]; then
  existing_document_id="${BASH_REMATCH[1]}"
  existing_chunk_count="${BASH_REMATCH[2]}"
  existing_storage_key="${BASH_REMATCH[3]}"
  existing_file_sha256="$(docker exec resume-backend sha256sum \
    "/app/uploads/$existing_storage_key" 2>/dev/null | awk '{print $1}' || true)"
  if [[ "$existing_file_sha256" == "$seed_sha256" ]] \
    && probe_fixture "$existing_document_id" "$existing_chunk_count" "$seed_sha256"; then
    echo "EXISTING|${existing_document_id}|${existing_chunk_count}|${existing_storage_key}"
    exit 0
  fi
fi

current_count="$(mysql_query \
  "SELECT COUNT(*) FROM knowledge_documents WHERE storage_key='${storage_key}';")"
[[ "$current_count" == "0" ]] || {
  echo "This release already has an unverified fixture row; recover the interrupted rollout before retrying" >&2
  exit 1
}

# Persist intent before the first file/DB/vector mutation. A killed process can
# therefore be recovered deterministically by storage key even before it knows
# the auto-increment document id.
persist_bootstrap_marker prepared 0
document_id=0
cleanup_created_fixture() {
  local exit_code="${1:-1}"
  local cleanup_status=0
  trap - ERR HUP INT TERM
  set +e
  cleanup_release_fixture || cleanup_status=1
  if [[ "$cleanup_status" -eq 0 ]]; then
    echo "RAG fixture bootstrap failed; DB row, vectors and file were compensated" >&2
    exit "$exit_code"
  fi
  echo "RAG fixture bootstrap failed and compensation is incomplete" >&2
  exit 75
}
trap 'cleanup_created_fixture $?' ERR
trap 'cleanup_created_fixture 129' HUP
trap 'cleanup_created_fixture 130' INT
trap 'cleanup_created_fixture 143' TERM

copy_fixture_to_backend
file_size="$(wc -c < "$SEED_FILE" | tr -d '[:space:]')"
[[ "$file_size" =~ ^[1-9][0-9]*$ ]]
document_id="$(mysql_query \
  "INSERT INTO knowledge_documents (name, category, source_type, scope, owner_user_id, resume_id, licensed, pii_reviewed, expires_at, description, file_name, mime_type, file_size, storage_key, storage_url, status, chunk_count, error_message, enabled, created_by) VALUES ('ResumeSystem Resume Writing Standard v1', 'resume-standard', 'standard', 'global', NULL, NULL, 1, 1, NULL, 'Canonical release fixture for strict RAG readiness', 'resume-writing-standard-v1.md', 'text/markdown', ${file_size}, '${storage_key}', '${storage_url}', 'indexing', 0, '', 1, NULL); SELECT LAST_INSERT_ID();" \
  | tail -1)"
[[ "$document_id" =~ ^[1-9][0-9]*$ ]]
persist_bootstrap_marker prepared "$document_id"

docker cp "$SEED_FILE" "resume-agent:$agent_fixture_path"
index_result="$(timeout --signal=TERM --kill-after=10s 210s \
  docker exec resume-agent python scripts/bootstrap_fixture.py index \
  "$document_id" "$agent_fixture_path")"
[[ "$index_result" =~ ^OK\|${document_id}\|([1-9][0-9]*)\|fastembed\|.+$ ]]
chunk_count="${BASH_REMATCH[1]}"
mysql_query \
  "UPDATE knowledge_documents SET status='ready', chunk_count=${chunk_count}, error_message='', enabled=1 WHERE id=${document_id} AND storage_key='${storage_key}' AND status='indexing'; SELECT ROW_COUNT();" \
  | tail -1 | grep -qx '1'
probe_fixture "$document_id" "$chunk_count" "$seed_sha256"
docker exec resume-agent rm -f "$agent_fixture_path"
persist_bootstrap_marker created "$document_id"

trap - ERR HUP INT TERM
echo "CREATED|${document_id}|${chunk_count}|${storage_key}"
