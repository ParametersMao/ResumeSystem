FROM node:22-bookworm-slim AS deps

WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
RUN npm ci --include=dev

FROM deps AS build

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV DEBIAN_FRONTEND=noninteractive
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN set -eux; \
  sed -i \
    -e 's|http://deb.debian.org/debian-security|http://mirrors.aliyun.com/debian-security|g' \
    -e 's|http://deb.debian.org/debian|http://mirrors.aliyun.com/debian|g' \
    /etc/apt/sources.list.d/debian.sources; \
  echo 'Acquire::Retries "5";' > /etc/apt/apt.conf.d/80-retries; \
  echo 'Acquire::http::Timeout "60";' >> /etc/apt/apt.conf.d/80-retries; \
  echo 'Acquire::https::Timeout "60";' >> /etc/apt/apt.conf.d/80-retries; \
  apt-get update; \
  for attempt in 1 2 3; do \
    apt-get install -y --no-install-recommends --fix-missing \
      chromium \
      fonts-noto-cjk \
      ca-certificates \
    && break; \
    apt-get -f install -y --no-install-recommends --fix-missing && break; \
    if [ "$attempt" = "3" ]; then exit 1; fi; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*; \
    sleep 10; \
    apt-get update; \
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
