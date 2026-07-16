FROM node:22-bookworm-slim AS deps

WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm ci --include=dev --prefer-offline

FROM deps AS build

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ARG DEBIAN_MIRROR=
ENV NODE_ENV=production
ENV DEBIAN_FRONTEND=noninteractive
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-headless-shell

RUN set -eux; \
  echo 'Acquire::Retries "5";' > /etc/apt/apt.conf.d/80-retries; \
  echo 'Acquire::http::Timeout "60";' >> /etc/apt/apt.conf.d/80-retries; \
  echo 'Acquire::https::Timeout "60";' >> /etc/apt/apt.conf.d/80-retries; \
  cp /etc/apt/sources.list.d/debian.sources /tmp/debian.sources.default; \
  certificates_ready=false; \
  for attempt in 1 2 3; do \
    rm -rf /var/lib/apt/lists/*; \
    if apt-get update \
        && apt-get install -y --no-install-recommends --fix-missing ca-certificates; then \
      certificates_ready=true; \
      break; \
    fi; \
    if [ "$attempt" != "3" ]; then sleep 10; fi; \
  done; \
  [ "$certificates_ready" = "true" ]; \
  update-ca-certificates; \
  if [ -n "$DEBIAN_MIRROR" ]; then \
    mirror="${DEBIAN_MIRROR%/}"; \
    sed -i \
      -e "s|http://deb.debian.org/debian-security|$mirror/debian-security|g" \
      -e "s|http://deb.debian.org/debian|$mirror/debian|g" \
      /etc/apt/sources.list.d/debian.sources; \
  fi; \
  installed=false; \
  for source_round in configured default; do \
    if [ "$source_round" = "default" ]; then \
      [ -n "$DEBIAN_MIRROR" ] || break; \
      cp /tmp/debian.sources.default /etc/apt/sources.list.d/debian.sources; \
    fi; \
    for attempt in 1 2 3; do \
      rm -rf /var/lib/apt/lists/*; \
      if apt-get update \
          && apt-get install -y --no-install-recommends --fix-missing \
            chromium-headless-shell fonts-noto-cjk ca-certificates; then \
        installed=true; \
        break 2; \
      fi; \
      apt-get -f install -y --no-install-recommends || true; \
      dpkg --configure -a || true; \
      if [ "$attempt" != "3" ]; then sleep 10; fi; \
    done; \
  done; \
  [ "$installed" = "true" ]; \
  command -v chromium-headless-shell; \
  dpkg-query -W -f='${db:Status-Status}' fonts-noto-cjk | grep -qx installed; \
  apt-get clean; \
  rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY public ./public
COPY database ./database
COPY scripts ./scripts

RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
