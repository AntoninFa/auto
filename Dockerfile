# syntax=docker/dockerfile:1.6.0

# S t a g e   b u i l d e r
ARG NODE_VERSION=20.8.1
FROM node:${NODE_VERSION}-bookworm AS builder

WORKDIR /home/node

COPY package.json package-lock.json nest-cli.json tsconfig*.json ./
COPY src ./src

RUN npm i -g --no-audit --no-fund npm
# RUN <<EOF
# npm i -g --no-audit --no-fund npm
# chmod 666 package*.json
# EOF

USER node

RUN <<EOF
# ci (= clean install) mit package-lock.json
npm ci --no-audit --no-fund
npm i -D --no-audit --no-fund rimraf
npm run build
EOF

# S t a g e   D e p s
FROM node:${NODE_VERSION}-bookworm-slim AS deps

WORKDIR /home/node

RUN npm i -g --no-audit --no-fund npm

USER node

COPY --chown=node:node package.json package-lock.json ./

# ci (= clean install) mit package-lock.json
# --omit dev: ohne devDependencies
RUN npm prune --omit=dev --omit=peer

# S t a g e   d u m b - i n i t
FROM debian:bookworm-slim AS dumb-init

# dumb-init installieren, um im finalen Image "node" aufrufen zu koennen
RUN <<EOF
# Katalog der verfuegbaren Debian-Packages aktualisieren
apt-get update
# Das eigentliche "Update" der installierten Debian-Packages
apt-get upgrade
# https://github.com/Yelp/dumb-init
# https://packages.debian.org/bookworm/dumb-init
apt-get install --no-install-recommends --yes dumb-init=1.2.5-2
apt-get autoremove --yes
apt-get clean --yes
rm -rf /var/lib/apt/lists/*
rm -rf /tmp/*
EOF

# S t a g e   F i n a l
FROM gcr.io/distroless/nodejs20-debian12:nonroot
# FROM gcr.io/distroless/nodejs20-debian12:debug-nonroot

LABEL org.opencontainers.image.title="auto" \
    org.opencontainers.image.description="Appserver auto mit distroless-Image" \
    org.opencontainers.image.version="2023.10.0-distroless" \
    org.opencontainers.image.licenses="GPL-3.0-or-later" \
    org.opencontainers.image.authors="yihu1011@h-ka.de"

WORKDIR /opt/app

COPY --chown=nonroot:nonroot package.json .env ./
COPY --from=deps --chown=nonroot:nonroot /home/node/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /home/node/dist ./dist
COPY --chown=nonroot:nonroot src/config/resources ./dist/config/resources
COPY --from=dumb-init /usr/bin/dumb-init /usr/bin/dumb-init

USER nonroot
EXPOSE 3000

ENTRYPOINT ["dumb-init", "/nodejs/bin/node", "dist/main.js"]
