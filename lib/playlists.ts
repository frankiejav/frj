import { readFile } from "fs/promises";
import path from "path";
import { enrichWithCovers } from "@/lib/album-art";
import { playlists, type PlaylistMeta } from "@/data/playlists";

export interface PlaylistTrack {
  id: number;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  duration: number;
  file: string;
  src: string;
}

export interface Playlist {
  meta: PlaylistMeta;
  tracks: PlaylistTrack[];
}

const MUSIC_ROOT = path.join(process.cwd(), "music");

function parseExtinf(line: string): { duration: number; label: string } | null {
  const match = line.match(/^#EXTINF:(-?\d+),(.+)$/);
  if (!match) return null;
  return { duration: Number(match[1]), label: match[2].trim() };
}

function splitArtistTitle(label: string): { artist: string; title: string } {
  const sep = label.indexOf(" - ");
  if (sep === -1) return { artist: "Unknown", title: label };
  return {
    artist: label.slice(0, sep).trim(),
    title: label.slice(sep + 3).trim(),
  };
}

export function parseM3u(content: string, playlistSlug: string): Omit<PlaylistTrack, "id">[] {
  const lines = content.split(/\r?\n/);
  const tracks: Omit<PlaylistTrack, "id">[] = [];
  let pending: { duration: number; label: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "#EXTM3U") continue;

    if (trimmed.startsWith("#")) {
      const extinf = parseExtinf(trimmed);
      if (extinf) pending = extinf;
      continue;
    }

    if (!pending) continue;

    const { artist, title } = splitArtistTitle(pending.label);
    tracks.push({
      title,
      artist,
      duration: pending.duration,
      file: trimmed,
      src: `/api/music/${playlistSlug}/${encodeURIComponent(trimmed)}`,
    });
    pending = null;
  }

  return tracks;
}

export async function getPlaylist(slug: string): Promise<Playlist | null> {
  const meta = playlists.find((p) => p.slug === slug);
  if (!meta) return null;

  const m3uPath = path.join(MUSIC_ROOT, meta.folder, meta.m3u);
  const content = await readFile(m3uPath, "utf-8");
  const parsed = parseM3u(content, meta.slug).map((track, i) => ({ ...track, id: i }));
  const tracks = await enrichWithCovers(parsed);

  return { meta, tracks };
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  const loaded = await Promise.all(playlists.map((p) => getPlaylist(p.slug)));
  return loaded.filter((p): p is Playlist => p !== null);
}

export function getMusicFilePath(playlistSlug: string, fileName: string): string | null {
  const meta = playlists.find((p) => p.slug === playlistSlug);
  if (!meta) return null;

  const filePath = path.join(MUSIC_ROOT, meta.folder, fileName);
  const resolved = path.resolve(filePath);
  const allowed = path.resolve(MUSIC_ROOT, meta.folder);

  if (!resolved.startsWith(allowed + path.sep) && resolved !== allowed) return null;
  return resolved;
}
