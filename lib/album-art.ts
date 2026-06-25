import { readFile, writeFile } from "fs/promises";
import path from "path";

export interface CoverResult {
  albumArt?: string;
  album?: string;
}

const CACHE_PATH = path.join(process.cwd(), "music", ".covers-cache.json");

function cacheKey(artist: string, title: string): string {
  return `${artist.toLowerCase()}|${title.toLowerCase()}`;
}

function upscaleArtwork(url: string): string {
  return url.replace(/\d+x\d+bb/, "600x600bb");
}

async function readCache(): Promise<Record<string, CoverResult>> {
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf-8")) as Record<string, CoverResult>;
  } catch {
    return {};
  }
}

async function writeCache(cache: Record<string, CoverResult>): Promise<void> {
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function fetchItunes(artist: string, title: string): Promise<CoverResult> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", `${artist} ${title}`);
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "1");

  const res = await fetch(url, { next: { revalidate: 86_400 } });
  if (!res.ok) return {};

  const json = (await res.json()) as {
    results?: { artworkUrl100?: string; collectionName?: string }[];
  };
  const hit = json.results?.[0];
  if (!hit?.artworkUrl100) return {};

  return {
    albumArt: upscaleArtwork(hit.artworkUrl100),
    album: hit.collectionName,
  };
}

export async function getAlbumCover(artist: string, title: string): Promise<CoverResult> {
  const key = cacheKey(artist, title);
  const cache = await readCache();
  if (cache[key]) return cache[key];

  const result = await fetchItunes(artist, title);
  cache[key] = result;
  await writeCache(cache);
  return result;
}

export async function enrichWithCovers<T extends { artist: string; title: string }>(
  tracks: T[],
): Promise<(T & CoverResult)[]> {
  const byKey = new Map(tracks.map((t) => [cacheKey(t.artist, t.title), t]));
  const cache = await readCache();
  const missing = [...byKey.keys()].filter((k) => !cache[k]);

  await Promise.all(
    missing.map(async (key) => {
      const track = byKey.get(key)!;
      cache[key] = await fetchItunes(track.artist, track.title);
    }),
  );

  if (missing.length > 0) await writeCache(cache);

  return tracks.map((track) => ({
    ...track,
    ...cache[cacheKey(track.artist, track.title)],
  }));
}
