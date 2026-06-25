export interface Track {
  title: string;
  artist: string;
  album?: string;
  url?: string;
  albumArt?: string;
  nowPlaying?: boolean;
  playedAt?: string;
}

export interface Activity {
  id: string;
  kind: "commit" | "release" | "repo" | "star" | "post";
  title: string;
  detail?: string;
  url?: string;
  at: string;
}

export interface ServiceResult<T> {
  data: T;
  live: boolean;
  source: string;
}
