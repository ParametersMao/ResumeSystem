#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm" || -z "${2:-}" ]]; then
  echo "Usage: $0 --confirm /absolute/path/to/backup" >&2
  exit 2
fi

BACKUP_DIR="$(readlink -f "$2")"
BACKUP_ROOT="$(readlink -f "${BACKUP_ROOT:-/opt/resumesystem-backups}")"
ENV_FILE="${ENV_FILE:-.env}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
PUBLIC_HOST="${PUBLIC_HOST:-aidana.top}"

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is not installed" >&2
  exit 1
fi

if [[ "$BACKUP_DIR" != "$BACKUP_ROOT"/* || ! -f "$BACKUP_DIR/SHA256SUMS" ]]; then
  echo "Backup must be a verified child of $BACKUP_ROOT" >&2
  exit 1
fi
for file in mysql.sql qdrant-storage.tar.gz uploads.tar.gz; do
  [[ -f "$BACKUP_DIR/$file" ]] || { echo "Missing $file" >&2; exit 1; }
done
if [[ ! -f "$ENV_FILE" || ! -f "$COMPOSE_FILE" ]]; then
  echo "Missing production env or compose file" >&2
  exit 1
fi

(
  cd "$BACKUP_DIR"
  sha256sum -c SHA256SUMS
)

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-resumesystem}"

stack_stopped=false
recover_stack_on_error() {
  if [[ "$stack_stopped" == "true" ]]; then
    "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-build >/dev/null 2>&1 || true
  fi
}
trap recover_stack_on_error ERR INT TERM

echo "Creating mandatory pre-restore backup..."
ENV_FILE="$ENV_FILE" COMPOSE_FILE="$COMPOSE_FILE" \
  BACKUP_ROOT="$BACKUP_ROOT" INCLUDE_IMAGES=false \
  "$(dirname "$0")/backup.sh"

"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  stop reverse-proxy web admin backend agent qdrant
stack_stopped=true

restore_volume() {
  local volume="$1"
  local archive="$2"
  docker run --rm \
    -v "${volume}:/data" \
    -v "${BACKUP_DIR}:/backup:ro" \
    alpine:3.20 sh -c \
      "find /data -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -xzf '/backup/${archive}' -C /data"
}

docker exec -i resume-mysql mysql \
  -uroot -p"$MYSQL_ROOT_PASSWORD" "$DB_DATABASE" < "$BACKUP_DIR/mysql.sql"
restore_volume "${PROJECT_NAME}_qdrant_data" qdrant-storage.tar.gz
restore_volume "${PROJECT_NAME}_backend_uploads" uploads.tar.gz
if [[ -f "$BACKUP_DIR/fastembed-models.tar.gz" ]]; then
  restore_volume "${PROJECT_NAME}_fastembed_models" fastembed-models.tar.gz
fi

if [[ -f "$BACKUP_DIR/docker-images.tar.gz" ]]; then
  gzip -dc "$BACKUP_DIR/docker-images.tar.gz" | docker load
fi

"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-build
stack_stopped=false
for _ in {1..30}; do
  backend_status="$(docker exec resume-backend node -e \
    "fetch('http://127.0.0.1:3000/api/health').then(async r=>{const j=await r.json(); if(!r.ok||j.status!=='ok')process.exit(1); process.stdout.write(j.status)}).catch(()=>process.exit(1))" \
    2>/dev/null || true)"
  public_status="$(curl -fsS --max-time 10 \
    --resolve "${PUBLIC_HOST}:443:127.0.0.1" \
    "https://${PUBLIC_HOST}/api/health" 2>/dev/null || true)"
  if [[ "$backend_status" == "ok" && "$public_status" == *'"status":"ok"'* ]]; then
    echo "restore: passed ($BACKUP_DIR)"
    exit 0
  fi
  sleep 2
done

echo "Restore completed but health check failed" >&2
exit 1
