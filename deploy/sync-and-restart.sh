#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${GITHUB_WORKSPACE:-$(cd "$(dirname "$0")/.." && pwd)}"
DEPLOY_DIR="${DEPLOY_DIR:-/home/nairobi/frjgarcia.com}"
ENV_FILE="${ENV_FILE:-$DEPLOY_DIR/.env}"
DEPLOY_COMPOSE_DIR="${DEPLOY_COMPOSE_DIR:-$DEPLOY_DIR/deploy}"

cd "$WORKSPACE"

export PATH="${HOME}/.nvm/versions/node/v22.23.1/bin:${PATH:-/usr/bin:/bin}"
command -v node >/dev/null || { echo "node not found in PATH"; exit 1; }

npm ci
npm run build

mkdir -p "$DEPLOY_DIR/.next/static"
rsync -a --delete "$WORKSPACE/.next/standalone/" "$DEPLOY_DIR/"
rsync -a --delete "$WORKSPACE/public/" "$DEPLOY_DIR/public/"
rsync -a --delete "$WORKSPACE/.next/static/" "$DEPLOY_DIR/.next/static/"

if [[ -f "$ENV_FILE" ]]; then
  cp "$ENV_FILE" "$DEPLOY_DIR/.env"
fi

mkdir -p "$DEPLOY_COMPOSE_DIR"
rsync -a "$WORKSPACE/deploy/Caddyfile" "$WORKSPACE/deploy/docker-compose.yml" "$WORKSPACE/deploy/setup-https.sh" "$DEPLOY_COMPOSE_DIR/"

systemctl --user restart frjgarcia.service

if docker compose -f "$DEPLOY_COMPOSE_DIR/docker-compose.yml" ps --status running -q caddy >/dev/null 2>&1; then
  docker compose -f "$DEPLOY_COMPOSE_DIR/docker-compose.yml" exec -T caddy caddy reload --config /etc/caddy/Caddyfile
else
  docker compose -f "$DEPLOY_COMPOSE_DIR/docker-compose.yml" up -d
fi

echo "Deployed to $DEPLOY_DIR"
