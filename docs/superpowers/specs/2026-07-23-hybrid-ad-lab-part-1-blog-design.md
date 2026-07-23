# Hybrid AD Lab Part 1 — Blog Import Design

## Goal

Publish the existing Obsidian note as a live blog post on frjgarcia.com, matching the Navidrome post conventions.

## Source

- Note: `~/Documents/obsidian/myNotes/04-projects/01-frjgarcia.com/Hybrid AD Lab Part 1 - Everything That Broke.md`
- Images (Obsidian Assets):
  - `devices-hybrid-joined-pending.png`
  - `connect-upn-not-added.png`
  - `tenant-license.png`

## Deliverables

1. `content/blog/hybrid-ad-lab-part-1-everything-that-broke.md`
   - Frontmatter:
     - `title`: Hybrid AD Lab Part 1 - Everything That Broke
     - `description`: one-line summary of DC setup, Entra sync, and hybrid-join failures
     - `pubDate`: 2026-07-23
     - no `draft` (defaults to published)
   - Body: note content unchanged aside from image path rewrites; keep `REDACTED` password placeholder

2. Images under `public/images/hybrid-ad-lab/`:
   - Copy the three PNGs from Obsidian Assets
   - Markdown references become `/images/hybrid-ad-lab/<filename>`

## Out of scope

- Routing, Velite schema, or site code changes
- Part 2 content
- Rewriting or expanding the article body

## Success criteria

- Post appears at `/blog/hybrid-ad-lab-part-1-everything-that-broke`
- Images render
- Listed on the blog index and RSS with pubDate 2026-07-23
