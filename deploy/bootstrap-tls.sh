#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm" ]]; then
  echo "Usage: $0 --confirm" >&2
  exit 2
fi

ACME_VERSION="${ACME_VERSION:-3.1.3}"
ACME_HOME="${ACME_HOME:-/root/.acme.sh}"
CERT_DIR="${CERT_DIR:-/etc/letsencrypt/live/aidana.top}"
PRIMARY_DOMAIN="${PRIMARY_DOMAIN:-aidana.top}"
DOMAINS=("$PRIMARY_DOMAIN" "www.aidana.top" "admin.aidana.top")

if [[ "$(id -u)" -ne 0 ]]; then
  echo "TLS bootstrap must run as root" >&2
  exit 1
fi
for domain in "${DOMAINS[@]}"; do
  resolved="$(getent ahostsv4 "$domain" | awk 'NR==1{print $1}')"
  [[ -n "$resolved" ]] || { echo "DNS does not resolve: $domain" >&2; exit 1; }
done

if [[ ! -x "$ACME_HOME/acme.sh" ]]; then
  source_dir="$(mktemp -d)"
  trap 'rm -rf -- "$source_dir"' EXIT
  git clone --depth 1 --branch "$ACME_VERSION" \
    https://github.com/acmesh-official/acme.sh.git "$source_dir"
  (
    cd "$source_dir"
    ./acme.sh --install --home "$ACME_HOME"
  )
fi

restore_proxy() {
  docker start resume-proxy >/dev/null 2>&1 || true
}
trap restore_proxy EXIT

"$ACME_HOME/acme.sh" --set-default-ca --server letsencrypt
docker stop resume-proxy >/dev/null 2>&1 || true
domain_args=()
for domain in "${DOMAINS[@]}"; do domain_args+=( -d "$domain" ); done
"$ACME_HOME/acme.sh" --issue --server letsencrypt --alpn --keylength ec-256 \
  "${domain_args[@]}" \
  --pre-hook 'docker stop resume-proxy >/dev/null 2>&1 || true' \
  --post-hook 'docker start resume-proxy >/dev/null 2>&1 || true' \
  --renew-hook 'docker exec resume-proxy nginx -s reload >/dev/null 2>&1 || true'

mkdir -p "$CERT_DIR"
"$ACME_HOME/acme.sh" --install-cert -d "$PRIMARY_DOMAIN" --ecc \
  --key-file "$CERT_DIR/privkey.pem" \
  --fullchain-file "$CERT_DIR/fullchain.pem" \
  --reloadcmd 'docker exec resume-proxy nginx -s reload >/dev/null 2>&1 || true'
chmod 600 "$CERT_DIR/privkey.pem"
chmod 644 "$CERT_DIR/fullchain.pem"
openssl x509 -checkend 2592000 -noout -in "$CERT_DIR/fullchain.pem"
echo "tls-bootstrap: passed ($PRIMARY_DOMAIN)"
