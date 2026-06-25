#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v docker >/dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  echo "Log out and back in, then re-run this script."
  exit 0
fi

if ! systemctl --user is-active t1566.service >/dev/null 2>&1; then
  echo "Warning: t1566.service is not running. Start it first:"
  echo "  systemctl --user start t1566"
fi

docker compose up -d
echo "Caddy is up on ports 80/443, proxying to the app on :3000."
