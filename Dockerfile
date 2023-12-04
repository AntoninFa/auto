# syntax=docker/dockerfile:1.6.0
ARG NODE_VERSION=20.10.0
FROM node:${NODE_VERSION}-bookworm AS builder

WORKDIR /home/node

COPY package.json package-lock.json nest-cli.json tsconfig*.json ./
COPY src ./src

RUN <<EOF
npm i -g --no-audit --no-fund npm
chmod 666 package*.json
EOF

USER node

RUN <<EOF
npm ci --no-audit --no-fund
npm i -D --no-audit --no-fund rimraf
npm run build
EOF

FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /home/node
RUN npm i -g --no-audit --no-fund npm
USER node
COPY --chown=node:node package.json package-lock.json ./

RUN npm prune --omit=dev --omit=peer

# STAGE  DUMB-INIT
FROM debian:bookworm-slim AS dumb-init

RUN <<EOF
apt-get update
apt-get upgrade
apt-get install --no-install-recommends -y dumb-init=1.2.5-2
apt-get autoremove --yes
apt-get clean --yes
rm -rf /var/lib/apt/lists/*
rm -rf /tmp/*
EOF

# STAGE FINAL
FROM gcr.io/distroless/nodejs20-debian12:nonroot

LABEL org.opencontainers.image.title="auto" \
    org.opencontainers.image.description="Appserver auto mit distroless-Image" \
    org.opencontainers.image.version="2024.04.0-distroless" \
    org.opencontainers.image.licenses="GPL-3.0-or-later"
WORKDIR /opt/app

COPY --chown=nonroot:nonroot package.json .env ./
COPY --from=deps --chown=nonroot:nonroot /home/node/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /home/node/dist ./dist
COPY --chown=nonroot:nonroot src/config/resources ./dist/config/resources
COPY --from=dumb-init /usr/bin/dumb-init /usr/bin/dumb-init
USER nonroot
EXPOSE 3000

ENTRYPOINT ["dumb-init", "/nodejs/bin/node", "dist/main.js"]