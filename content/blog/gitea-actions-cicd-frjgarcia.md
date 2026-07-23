---
title: "Automating Deploys for frjgarcia.com with Gitea Actions"
description: "Self-hosted Gitea Actions, an act_runner on the VPS, and a systemd + Caddy deploy path that ships on every push to main."
pubDate: 2026-07-09
---

I'm walking through how I set up a CI/CD pipeline for this site. The repo lives on a self-hosted gitea instance in my homelab, the site runs on a remote VPS, and a push to `main` builds and deploys automatically. This covers the architecture choice, the concrete setup, and the failures that made the first few runs less automatic than advertised.

## Before CI/CD

The production stack was already a split setup. Next.js builds to a standalone server and runs under a user systemd unit on port 3000. Caddy runs in Docker and terminates TLS, then proxies to `host.docker.internal:3000`. That part worked fine. What did not scale was my deploy process: build on my workstation, copy artifacts onto the VPS, restart systemd, and hope I remembered the static files.

The site was also mid-rename from `t1566.com` to `frjgarcia.com`, so the CI work landed at the same time as updating domains, env vars, unit names, and Caddyfile hosts.

## Why the Runner Lives on Prod

I considered putting `act_runner` on the homelab and SSHing into the VPS from each job. That keeps build CPU off the public box, but it also means managing deploy keys, teaching the homelab how to resolve my workstation SSH aliases, and debugging remote orchestration when something fails at 1am.

The VPS already had Node via nvm, Docker, and systemd linger enabled for the deploy user. Putting the runner there meant the workflow could build in the runner workspace and sync straight into the live directory. No `git pull` on prod, no SSH secrets in gitea, and Tailscale already connects the VPS to the gitea instance.

## Architecture

```
workstation  --push-->  gitea (homelab)
                           |
                           v
                    act_runner (VPS, label: prod)
                           |
           npm ci + npm run build (Next standalone)
                           |
           sync artifacts -> ~/frjgarcia.com
                           |
           systemctl --user restart frjgarcia
                           |
           caddy reload (or compose up if down)
```

Gitea Actions is GitHub Actions-compatible enough that the workflows look familiar. The important difference is the runner: mine is registered with `prod:host`, so jobs with `runs-on: prod` execute on the host instead of inside a disposable ubuntu container. That mattered once I needed the job to talk to local systemd and Docker.

## Enabling Actions on Gitea

Actions was off by default. I enabled it in the gitea `app.ini`:

```ini
[actions]
ENABLED = true
```

After restarting gitea I generated a runner registration token:

```bash
gitea actions generate-runner-token
```

## Installing act_runner on the VPS

I downloaded the binary, dropped it under `~/.local/bin`, generated a config, and registered against the Tailscale address of gitea. The VPS could not resolve the MagicDNS hostname I use from my workstation, but the Tailscale IP worked:

```bash
act_runner generate-config > ~/.config/act_runner/config.yaml

act_runner register \
  --no-interactive \
  --instance "http://<gitea-tailscale-ip>:3000" \
  --token "<registration-token>" \
  --name "prod1-hosting" \
  --config ~/.config/act_runner/config.yaml
```

CLI `--labels` got ignored when labels were already defined in the config file. I set `prod:host` in `config.yaml` so host-mode jobs actually land on this machine:

```yaml
runner:
  labels:
    - "prod:host"
```

Then I installed a user systemd unit so the runner survives reboots:

```ini
[Unit]
Description=Gitea Actions runner (act_runner)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment=PATH=/home/nairobi/.nvm/versions/node/v22.23.1/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
WorkingDirectory=%h/.config/act_runner
ExecStart=%h/.local/bin/act_runner daemon --config %h/.config/act_runner/config.yaml
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

That `PATH` line is not optional. More on that below.

## The Deploy Path

I kept the workflow intentionally thin. Checkout, then run a shell script:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: prod
    steps:
      - uses: actions/checkout@v4
      - run: bash deploy/sync-and-restart.sh
        env:
          DEPLOY_DIR: /home/nairobi/frjgarcia.com
```

`deploy/sync-and-restart.sh` does the real work: `npm ci`, `npm run build` (velite runs through `next.config.ts`), copies the standalone output plus `public/` and `.next/static/` into the live directory, restarts `frjgarcia.service`, and reloads Caddy if it is already running.

I also added a PR workflow that only builds. Same runner, no restart.

## What Broke

### Failure 1: Cannot find node in PATH

The first run died immediately on `actions/checkout@v4` with `Cannot find: node in PATH`. The checkout action is a node script. Host-mode act_runner does not inherit my interactive shell, so nvm's Node was invisible until I put it on the systemd unit's `PATH`.

I also dropped `actions/setup-node` from the deploy workflow. On a host runner that already has Node pinned via nvm, setup-node was just another moving part. The script exports the same nvm path before calling `npm`.

### Failure 2: rsync does not exist

The first version of the sync script used `rsync -a --delete`. Prod did not have rsync installed. I could've installed rsync but since resources on my VPS are limited I opted to use the tools it already has.

### Failure 2: .env copied onto itself

Build succeeded. Artifact sync succeeded. Then the script did `cp "$ENV_FILE" "$DEPLOY_DIR/.env"` where both paths were the same file, `cp` exited non-zero, and `set -e` killed the job before the systemd restart. The fix is boring and important:

```bash
if [[ -f "$ENV_FILE" && "$ENV_FILE" != "$DEPLOY_DIR/.env" ]]; then
  cp "$ENV_FILE" "$DEPLOY_DIR/.env"
fi
```

My third push was the first green run. Gitea Actions logged `Job succeeded`, `frjgarcia.service` restarted, Caddy reloaded, and port 3000 returned 200.

## Day to Day

- I push to `main` and it deploys.
- Manual deploys go through gitea → Actions → Deploy → Run workflow.
- PRs get a build check so a broken `npm run build` shows up before I merge.
- `.env` stays on the server only. The workflow never commits it.

## Takeaways

- I put the runner where the side effects need to happen because that kept the system simpler. SSH-from-homelab was the "cleaner" diagram and the worse operational model for this site.
- Host-mode runners are not containers. PATH, available binaries, and cwd assumptions are part of the deploy surface.
- Read the first failing line, not the last. The `.env` self-copy looked like a restart failure until the log showed `cp` complaining about identical paths.
- Keep secrets and live config off the runner workspace. I sync artifacts into a stable deploy directory and leave `.env` alone unless it's actually moved.
