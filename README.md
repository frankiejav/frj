# frjgarcia.com

Personal Website

## Stack

- **Next.js 16** (App Router, React Server Components) + **TypeScript**
- **Velite** — type-safe content layer (Zod-validated MDX/Markdown)
- **Global CSS tokens + CSS Modules** — editorial design system, no Tailwind
- **next-themes** — light/dark mode keyed on `[data-theme]`
- **next/font** — Literata (serif) with Latin + Cyrillic subsets
- **Docker + Caddy** — standalone runtime behind an auto-HTTPS reverse proxy

## Structure

```
app/                 Routes (home, blog, photos, listening, bookmarks, about, now)
  blog/[slug]/       Individual posts (rendered from Velite)
  rss.xml/route.ts   RSS feed
  sitemap.ts         Sitemap
  robots.ts          robots.txt
components/          Header, Footer, ThemeToggle, animations, widgets
content/blog/        Markdown posts (source of truth)
data/                Photos, bookmarks, reading, profile/social links
lib/                 Constants, formatting, posts helper, live-data services
.velite/             Generated content (gitignored)
```

## Content

- **Blog** — add a `.md`/`.mdx` file under `content/blog/`. Frontmatter:

  ```yaml
  ---
  title: "Post title"
  description: "One-line summary."
  pubDate: 2026-06-24
  updatedDate: 2026-06-25        # optional
  heroImage: /images/cover.png   # optional
  animation: filetree            # optional: terminal | filetree | phishing-redirect | websocket-skim
  draft: false                   # optional
  ---
  ```

  Images referenced as `/images/...` are served from `public/images/`.

- **Photos / bookmarks / reading / links** — edit the typed files in `data/`.
- **Listening / activity widgets** — backed by `lib/services/`. They render
  sample data until API keys are provided (see Environment), then fetch live and
  revalidate on a timer.

## Environment

Copy the example and fill in what you want. Everything is optional; the site
runs fully without any keys.

```bash
cp .env.example .env
```

| Variable               | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO/RSS/sitemap             |
| `LASTFM_API_KEY`       | Last.fm — live "listening" widget             |
| `LASTFM_USER`          | Last.fm username                              |
| `GITHUB_USERNAME`      | GitHub — live "activity" widget               |
| `GITHUB_TOKEN`         | Optional, raises GitHub rate limits           |

## Develop

```bash
npm install
npm run dev          # http://localhost:3000 (rebuilds content in watch mode)
```

`npm run content` rebuilds the Velite content layer on demand.

## Build

```bash
npm run build        # runs Velite then builds the standalone server
```

## Deploy (VPS)

Production runs a **split stack**: Next.js standalone via systemd on port 3000,
Caddy in Docker for TLS and reverse proxy. See [`deploy/`](deploy/) for unit
file, Caddyfile, and compose config.

1. Point `frjgarcia.com` (and `www`) DNS A/AAAA records at the VPS.
2. Install Docker, Node 22 (nvm), and enable user lingering for the deploy user.
3. Create `~/frjgarcia.com/.env` from [`.env.example`](.env.example) (never commit
   this file).
4. Install the systemd unit from [`deploy/frjgarcia.service`](deploy/frjgarcia.service)
   to `~/.config/systemd/user/frjgarcia.service`, then
   `systemctl --user enable --now frjgarcia`.
5. Start Caddy: `bash deploy/setup-https.sh` from the deploy directory on the server.

### CI/CD

Pushes to `main` trigger a Gitea Actions workflow (`.gitea/workflows/deploy.yml`)
that builds on the prod runner and runs [`deploy/sync-and-restart.sh`](deploy/sync-and-restart.sh).

- **Automatic deploy** — push to `main`
- **Manual deploy** — Gitea → Actions → Deploy → Run workflow
- **PR checks** — `.gitea/workflows/ci.yml` runs `npm run build` on pull requests

The live app directory on prod is `/home/frj/frjgarcia.com`. Environment
variables live in `/home/frj/frjgarcia.com/.env` on the server only.

### Running without Docker (local)

```bash
npm run build
node .next/standalone/server.js   # serves on PORT (default 3000)
```

Make sure `public/` and `.next/static/` sit next to the standalone server (the
Dockerfile and deploy script handle this copy automatically).
