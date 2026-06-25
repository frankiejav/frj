import type { ServiceResult, Track } from "./types";

const SAMPLE_TRACKS: Track[] = [
  { title: "Nikes", artist: "Frank Ocean", album: "Blonde", nowPlaying: true },
  { title: "Hour Glass", artist: "Mac DeMarco", album: "Salad Days", playedAt: "2026-06-24T01:12:00Z" },
  { title: "Tadow", artist: "Masego, FKJ", album: "Tadow", playedAt: "2026-06-23T22:48:00Z" },
  { title: "Pink + White", artist: "Frank Ocean", album: "Blonde", playedAt: "2026-06-23T21:10:00Z" },
  { title: "Sparks", artist: "Beach House", album: "Bloom", playedAt: "2026-06-23T19:55:00Z" },
];

interface LastfmTrack {
  name: string;
  artist: { "#text": string };
  album: { "#text": string };
  url: string;
  image: { "#text": string; size: string }[];
  date?: { uts: string };
  "@attr"?: { nowplaying?: string };
}

/**
 * Last.fm recent tracks. Set LASTFM_API_KEY and LASTFM_USER to go live.
 * Falls back to sample data so the UI is always populated.
 */
export async function getRecentTracks(limit = 5): Promise<ServiceResult<Track[]>> {
  const apiKey = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USER;

  if (!apiKey || !user) {
    return { data: SAMPLE_TRACKS.slice(0, limit), live: false, source: "sample" };
  }

  try {
    const url = new URL("https://ws.audioscrobbler.com/2.0/");
    url.searchParams.set("method", "user.getrecenttracks");
    url.searchParams.set("user", user);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Last.fm ${res.status}`);

    const json = (await res.json()) as {
      recenttracks?: { track?: LastfmTrack[] };
    };
    const tracks = json.recenttracks?.track ?? [];

    const data: Track[] = tracks.slice(0, limit).map((t) => ({
      title: t.name,
      artist: t.artist["#text"],
      album: t.album["#text"] || undefined,
      url: t.url,
      albumArt: t.image?.find((i) => i.size === "large")?.["#text"] || undefined,
      nowPlaying: t["@attr"]?.nowplaying === "true",
      playedAt: t.date ? new Date(Number(t.date.uts) * 1000).toISOString() : undefined,
    }));

    return { data, live: true, source: "last.fm" };
  } catch {
    return { data: SAMPLE_TRACKS.slice(0, limit), live: false, source: "sample" };
  }
}
