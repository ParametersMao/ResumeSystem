#!/bin/sh
set -eu

BAKED_CACHE=/opt/fastembed-models
BAKED_MANIFEST=/opt/fastembed-models.SHA256SUMS
BAKED_LINK_MANIFEST=/opt/fastembed-models.SYMLINKS
RUNTIME_CACHE_PATH="${FASTEMBED_CACHE_PATH:-/models/fastembed/current}"

case "$RUNTIME_CACHE_PATH" in
  /*) ;;
  *)
    echo "FASTEMBED_CACHE_PATH must be an absolute path" >&2
    exit 1
    ;;
esac
if [ "$RUNTIME_CACHE_PATH" = "/" ] || [ "$RUNTIME_CACHE_PATH" = "$BAKED_CACHE" ]; then
  echo "FASTEMBED_CACHE_PATH must be a dedicated writable runtime pointer" >&2
  exit 1
fi
RUNTIME_CACHE_ROOT="$(dirname "$RUNTIME_CACHE_PATH")"
if [ "$RUNTIME_CACHE_ROOT" = "/" ]; then
  echo "FASTEMBED_CACHE_PATH must be below a dedicated writable directory" >&2
  exit 1
fi

verify_cache() {
  candidate="$1"
  candidate_file_manifest="$(mktemp)" || return 1
  candidate_link_manifest="$(mktemp)" || {
    rm -f "$candidate_file_manifest"
    return 1
  }
  verification_status=1
  if [ -d "$candidate" ] \
    && [ -s "$BAKED_MANIFEST" ] \
    && [ -s "$BAKED_LINK_MANIFEST" ] \
    && (cd "$candidate" \
      && find . -type f -print0 | sort -z | xargs -0 sha256sum) \
      > "$candidate_file_manifest" \
    && (cd "$candidate" \
      && find . -type l -printf '%p\t%l\n' | LC_ALL=C sort) \
      > "$candidate_link_manifest" \
    && cmp -s "$candidate_file_manifest" "$BAKED_MANIFEST" \
    && cmp -s "$candidate_link_manifest" "$BAKED_LINK_MANIFEST"; then
    verification_status=0
  fi
  rm -f "$candidate_file_manifest" "$candidate_link_manifest"
  return "$verification_status"
}

# Verify the image copy before touching the persistent volume. A corrupt image
# must fail closed instead of replacing a good cache with bad bytes.
verify_cache "$BAKED_CACHE" || {
  echo "Baked FastEmbed model manifest verification failed" >&2
  exit 1
}

# Never replace another release's cache. The model artifact manifest selects a
# dedicated immutable subdirectory, so an application image rollback can still
# start from its prior cache without network access.
MODEL_ARTIFACT_SHA256="$(cat "$BAKED_MANIFEST" "$BAKED_LINK_MANIFEST" \
  | sha256sum | awk '{print $1}')"
case "$MODEL_ARTIFACT_SHA256" in
  [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*) ;;
  *)
    echo "FastEmbed model artifact digest is invalid" >&2
    exit 1
    ;;
esac
RUNTIME_CACHE="$RUNTIME_CACHE_ROOT/releases/$MODEL_ARTIFACT_SHA256"

if ! verify_cache "$RUNTIME_CACHE"; then
  mkdir -p "$RUNTIME_CACHE"
  # No application process exists yet, so repairing the mounted volume here is
  # race-free. A killed copy is detected and repeated on the next restart.
  find "$RUNTIME_CACHE" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
  cp -a "$BAKED_CACHE"/. "$RUNTIME_CACHE"/
  verify_cache "$RUNTIME_CACHE" || {
    echo "FastEmbed runtime cache repair failed" >&2
    exit 1
  }
fi

# Docker exec processes inherit the container's configured environment, not
# environment mutations made by PID 1. Publish an atomic stable pointer so the
# lifespan process, release bootstrap CLI, recovery probes, and manual execs all
# resolve the same immutable offline model directory.
runtime_pointer_temp="$RUNTIME_CACHE_ROOT/.fastembed-current.$$"
rm -f "$runtime_pointer_temp"
ln -s "releases/$MODEL_ARTIFACT_SHA256" "$runtime_pointer_temp"
mv -Tf "$runtime_pointer_temp" "$RUNTIME_CACHE_PATH"
verify_cache "$RUNTIME_CACHE_PATH" || {
  echo "FastEmbed runtime cache pointer verification failed" >&2
  exit 1
}

export FASTEMBED_CACHE_PATH="$RUNTIME_CACHE_PATH"
exec "$@"
