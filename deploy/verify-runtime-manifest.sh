#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -ne 3 || ! "${1:-}" =~ ^(--directory|--archive)$ ]]; then
  echo "Usage: $0 (--directory /immutable/release | --archive source-with-env.tar.gz) manifest.json" >&2
  exit 2
fi

MODE="$1"
SOURCE="$2"
MANIFEST="$(readlink -f "$3" 2>/dev/null || true)"
[[ -f "$MANIFEST" ]] || { echo "Runtime manifest is missing" >&2; exit 1; }
if [[ "$MODE" == "--directory" ]]; then
  SOURCE="$(readlink -f "$SOURCE" 2>/dev/null || true)"
  [[ -d "$SOURCE" ]] || { echo "Runtime source directory is missing" >&2; exit 1; }
else
  SOURCE="$(readlink -f "$SOURCE" 2>/dev/null || true)"
  [[ -f "$SOURCE" ]] || { echo "Runtime source archive is missing" >&2; exit 1; }
fi

docker inspect resume-agent >/dev/null 2>&1 || {
  echo "The running Agent container is required to parse the release manifest" >&2
  exit 1
}
rows_file="$(mktemp)"
cleanup_rows() { rm -f -- "$rows_file"; }
trap cleanup_rows EXIT
if ! docker exec -i resume-agent python -c '
import json, re, sys
data = json.load(sys.stdin)
commit = data.get("releaseCommit")
runtime = data.get("runtimeFiles")
if not isinstance(commit, str) or not re.fullmatch(r"[0-9a-f]{40}", commit):
    raise SystemExit("invalid releaseCommit")
if not isinstance(runtime, dict) or len(runtime) < 10:
    raise SystemExit("invalid runtimeFiles")
print("@commit\t" + commit)
for path in sorted(runtime):
    digest = runtime[path]
    if (
        not isinstance(path, str)
        or not re.fullmatch(r"[A-Za-z0-9._/-]+", path)
        or path.startswith("/")
        or ".." in path.split("/")
        or not isinstance(digest, str)
        or not re.fullmatch(r"[0-9a-f]{64}", digest)
    ):
        raise SystemExit("invalid runtime file entry")
    print(path + "\t" + digest)
' < "$MANIFEST" > "$rows_file"; then
  echo "Release manifest runtimeFiles could not be parsed" >&2
  exit 1
fi

expected_commit=""
verified_count=0
while IFS=$'\t' read -r runtime_path expected_hash; do
  if [[ "$runtime_path" == "@commit" ]]; then
    [[ -z "$expected_commit" && "$expected_hash" =~ ^[0-9a-f]{40}$ ]] || {
      echo "Release manifest commit row is invalid" >&2
      exit 1
    }
    expected_commit="$expected_hash"
    continue
  fi
  [[ -n "$expected_commit" && "$expected_hash" =~ ^[0-9a-f]{64}$ ]] || {
    echo "Release manifest runtime row is invalid" >&2
    exit 1
  }
  if [[ "$MODE" == "--directory" ]]; then
    runtime_file="$(readlink -f "$SOURCE/$runtime_path" 2>/dev/null || true)"
    [[ "$runtime_file" == "$SOURCE"/* && -f "$runtime_file" && ! -L "$SOURCE/$runtime_path" ]] || {
      echo "Runtime file is missing or unsafe: $runtime_path" >&2
      exit 1
    }
    actual_hash="$(sha256sum "$runtime_file" | awk '{print $1}')"
  else
    archive_member="./$runtime_path"
    member_count="$(tar -tzf "$SOURCE" | grep -Fxc "$archive_member" || true)"
    [[ "$member_count" == 1 ]] || {
      echo "Runtime archive member is missing or duplicated: $runtime_path" >&2
      exit 1
    }
    actual_hash="$(tar -xOzf "$SOURCE" "$archive_member" | sha256sum | awk '{print $1}')"
  fi
  [[ "$actual_hash" == "$expected_hash" ]] || {
    echo "Runtime file hash mismatch: $runtime_path" >&2
    exit 1
  }
  ((verified_count += 1))
done < "$rows_file"

[[ -n "$expected_commit" && "$verified_count" -ge 10 ]] || {
  echo "Runtime manifest did not verify enough files" >&2
  exit 1
}
if [[ "$MODE" == "--directory" ]]; then
  source_commit="$(awk -F= '$1 == "RELEASE_COMMIT" {print $2}' "$SOURCE/.env" | tail -1 | tr -d '\r')"
else
  source_commit="$(tar -xOzf "$SOURCE" ./.env 2>/dev/null \
    | awk -F= '$1 == "RELEASE_COMMIT" {print $2}' | tail -1 | tr -d '\r')"
fi
[[ "$source_commit" == "$expected_commit" ]] || {
  echo "Runtime source commit does not match the release artifact manifest" >&2
  exit 1
}

echo "runtime-manifest: passed ($verified_count files, $expected_commit)"
