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
ENV NODE_ENV=production
ENV DEBIAN_FRONTEND=noninteractive
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-headless-shell

RUN set -eux; \
  echo 'Acquire::Retries "5";' > /etc/apt/apt.conf.d/80-retries; \
  echo 'Acquire::http::Timeout "60";' >> /etc/apt/apt.conf.d/80-retries; \
  echo 'Acquire::https::Timeout "60";' >> /etc/apt/apt.conf.d/80-retries; \
  for attempt in 1 2 3; do \
    apt-get update && apt-get install -y --no-install-recommends --fix-missing \
      chromium-headless-shell \
      fonts-noto-cjk \
      ca-certificates \
    && break; \
    if [ "$attempt" = "3" ]; then exit 1; fi; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*; \
    sleep 10; \
  done; \
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
