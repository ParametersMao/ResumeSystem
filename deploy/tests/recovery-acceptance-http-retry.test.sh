#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="${REPO_ROOT:-/repo}"
TEST_ROOT="$(mktemp -d)"
trap 'rm -rf "$TEST_ROOT"' EXIT
mkdir -p "$TEST_ROOT/bin"
printf '# recovery retry test\n' > "$TEST_ROOT/recovery.env"

cat > "$TEST_ROOT/bin/curl" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
url=""
has_headers=false
args="$*"
for arg in "$@"; do
  [[ "$arg" == http://* || "$arg" == https://* ]] && url="$arg"
  [[ "$arg" == -D ]] && has_headers=true
done

increment() {
  local file="$1"
  local value=0
  [[ -f "$file" ]] && value="$(cat "$file")"
  value=$((value + 1))
  printf '%s\n' "$value" > "$file"
  printf '%s' "$value"
}

case "$url" in
  http://127.0.0.1/api/health)
    printf '{"status":"ok"}'
    ;;
  http://127.0.0.1/api/auth/cuser/login)
    if [[ "$args" == *"https://untrusted.invalid"* ]]; then
      printf '403'
    elif [[ "$args" == *"-X POST"* ]]; then
      printf '401'
    else
      printf 'HTTP/1.1 204 No Content\r\nAccess-Control-Allow-Origin: http://121.43.208.184\r\nAccess-Control-Allow-Credentials: true\r\n\r\n'
    fi
    ;;
  http://127.0.0.1/assets/app.js)
    printf 'HTTP/1.1 200 OK\r\nContent-Type: application/javascript\r\n\r\n'
    ;;
  http://127.0.0.1/admin/js/main-test.js)
    printf 'HTTP/1.1 200 OK\r\nContent-Type: application/javascript\r\n\r\n'
    ;;
  http://127.0.0.1/admin/)
    if [[ "$has_headers" == true ]]; then
      count="$(increment "${ADMIN_COUNT_FILE:?}")"
      if ((count <= ${ADMIN_FAILS_BEFORE_SUCCESS:-0})); then
        printf 'HTTP/1.1 502 Bad Gateway\r\n\r\n'
      else
        printf 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n'
      fi
    else
      printf '<html><script src="/admin/js/main-test.js"></script></html>'
    fi
    ;;
  http://127.0.0.1/)
    if [[ "$has_headers" == true ]]; then
      count="$(increment "${WEB_COUNT_FILE:?}")"
      if ((count <= ${WEB_FAILS_BEFORE_SUCCESS:-0})); then
        printf 'HTTP/1.1 502 Bad Gateway\r\n\r\n'
      else
        printf 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n'
      fi
    else
      printf '<html><div id="app"></div><script src="/assets/app.js"></script></html>'
    fi
    ;;
  *)
    echo "Unexpected curl URL: $url ($*)" >&2
    exit 2
    ;;
esac
EOF

cat > "$TEST_ROOT/bin/docker" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
[[ "$*" == "exec resume-agent python -c "* ]]
printf 'ok|false|disabled||false\n'
EOF

cat > "$TEST_ROOT/bin/sleep" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "${SLEEP_LOG:?}"
EOF
chmod 0755 "$TEST_ROOT/bin/curl" "$TEST_ROOT/bin/docker" "$TEST_ROOT/bin/sleep"

export PATH="$TEST_ROOT/bin:$PATH"
export WEB_COUNT_FILE="$TEST_ROOT/web.count"
export ADMIN_COUNT_FILE="$TEST_ROOT/admin.count"
export SLEEP_LOG="$TEST_ROOT/sleep.log"
export WEB_FAILS_BEFORE_SUCCESS=2
export ADMIN_FAILS_BEFORE_SUCCESS=1

ENV_FILE="$TEST_ROOT/recovery.env" \
RAG_REQUIRED=false \
RECOVERY_STATIC_PROBE_ATTEMPTS=5 \
RECOVERY_STATIC_PROBE_DELAY_SECONDS=0 \
  "$REPO_ROOT/deploy/recovery-acceptance.sh" \
  > "$TEST_ROOT/success.out"
grep -Fq 'recovery-acceptance: passed' "$TEST_ROOT/success.out"
[[ "$(cat "$WEB_COUNT_FILE")" == 4 ]]
[[ "$(cat "$ADMIN_COUNT_FILE")" == 2 ]]
[[ "$(wc -l < "$SLEEP_LOG" | tr -d ' ')" == 3 ]]

# A permanently unavailable Web entry stops after the configured bound and
# does not fall through to auth/Agent checks as if recovery had succeeded.
rm -f "$WEB_COUNT_FILE" "$ADMIN_COUNT_FILE" "$SLEEP_LOG"
export WEB_FAILS_BEFORE_SUCCESS=99
export ADMIN_FAILS_BEFORE_SUCCESS=0
set +e
ENV_FILE="$TEST_ROOT/recovery.env" \
RAG_REQUIRED=false \
RECOVERY_STATIC_PROBE_ATTEMPTS=3 \
RECOVERY_STATIC_PROBE_DELAY_SECONDS=0 \
  "$REPO_ROOT/deploy/recovery-acceptance.sh" \
  > "$TEST_ROOT/failure.out" 2> "$TEST_ROOT/failure.err"
status=$?
set -e
[[ "$status" -ne 0 ]]
[[ "$(cat "$WEB_COUNT_FILE")" == 3 ]]
grep -Fq 'Recovery public web entry failed after 3 attempts' "$TEST_ROOT/failure.err"

echo "recovery-acceptance-http-retry.test: passed"
