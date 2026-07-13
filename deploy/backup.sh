#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/resumesystem-backups}"
INCLUDE_IMAGES="${INCLUDE_IMAGES:-false}"
RETENTION_COUNT="${RETENTION_COUNT:-7}"
STAMP="$(date +%Y%m%d-%H%M%S)"
FINAL_DIR="${BACKUP_ROOT%/}/v1.3-${STAMP}"
TEMP_DIR="${FINAL_DIR}.partial"

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is not installed" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" || ! -f "$COMPOSE_FILE" ]]; then
  echo "Missing production env or compose file" >&2
  exit 1
fi
if [[ "$BACKUP_ROOT" != /* || "$BACKUP_ROOT" == "/" ]]; then
  echo "BACKUP_ROOT must be an absolute non-root path" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-resumesystem}"

for name in resume-mysql resume-backend resume-agent resume-qdrant; do
  docker inspect "$name" >/dev/null
done

rm -rf -- "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
chmod 700 "$TEMP_DIR"
rag_stopped=false
cleanup_on_error() {
  if [[ "$rag_stopped" == "true" ]]; then
    "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d qdrant agent >/dev/null 2>&1 || true
  fi
  rm -rf -- "$TEMP_DIR"
}
trap cleanup_on_error ERR INT TERM

docker exec resume-mysql mysqldump \
  --single-transaction --routines --triggers \
  -uroot -p"$MYSQL_ROOT_PASSWORD" "$DB_DATABASE" > "$TEMP_DIR/mysql.sql"

docker exec resume-agent python -c \
  "from qdrant_client import QdrantClient; r=QdrantClient(url='http://qdrant:6333').create_snapshot(collection_name='${QDRANT_COLLECTION}'); print(r.name)" \
  > "$TEMP_DIR/qdrant-snapshot-name.txt"

archive_volume() {
  local volume="$1"
  local output="$2"
  docker run --rm \
    -v "${volume}:/data:ro" \
    -v "${TEMP_DIR}:/backup" \
    alpine:3.20 sh -c "tar -czf '/backup/${output}' -C /data ."
}

# Freeze only the RAG services while archiving Qdrant's storage. This avoids a
# crash-inconsistent volume without interrupting login, editing or PDF export.
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop agent qdrant
rag_stopped=true
archive_volume "${PROJECT_NAME}_qdrant_data" qdrant-storage.tar.gz
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d qdrant agent
rag_stopped=false
archive_volume "${PROJECT_NAME}_backend_uploads" uploads.tar.gz
archive_volume "${PROJECT_NAME}_fastembed_models" fastembed-models.tar.gz

tar -czf "$TEMP_DIR/source-with-env.tar.gz" \
  --exclude='./backups' --exclude='./node_modules' --exclude='./*/node_modules' .
docker ps --format '{{json .}}' > "$TEMP_DIR/containers.jsonl"
mapfile -t BACKUP_IMAGES < <(
  for name in resume-web resume-admin resume-backend resume-agent resume-qdrant resume-proxy resume-mysql; do
    docker inspect "$name" --format '{{.Config.Image}}'
  done | sort -u
)
docker image inspect "${BACKUP_IMAGES[@]}" > "$TEMP_DIR/images.json"

if [[ "$INCLUDE_IMAGES" == "true" ]]; then
  docker save "${BACKUP_IMAGES[@]}" | gzip -1 > "$TEMP_DIR/docker-images.tar.gz"
fi

printf '%s\n' "${RELEASE_COMMIT:-unknown}" > "$TEMP_DIR/release-commit.txt"
(
  cd "$TEMP_DIR"
  sums_file="$(mktemp)"
  find . -maxdepth 1 -type f ! -name SHA256SUMS -printf '%f\n' \
    | sort | xargs sha256sum > "$sums_file"
  mv "$sums_file" SHA256SUMS
  sha256sum -c SHA256SUMS
)

chmod -R go-rwx "$TEMP_DIR"
mv "$TEMP_DIR" "$FINAL_DIR"
trap - ERR INT TERM

if [[ "$RETENTION_COUNT" =~ ^[1-9][0-9]*$ ]]; then
  mapfile -t old_backups < <(
    find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -name 'v1.3-*' -printf '%f\n' \
      | sort -r | tail -n "+$((RETENTION_COUNT + 1))"
  )
  for name in "${old_backups[@]}"; do
    target="$BACKUP_ROOT/$name"
    [[ "$target" == "$BACKUP_ROOT"/v1.3-* ]] || continue
    rm -rf -- "$target"
  done
fi
echo "backup: passed ($FINAL_DIR)"
