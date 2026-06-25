export interface PlaylistMeta {
  id: string;
  slug: string;
  name: string;
  folder: string;
  m3u: string;
}

export const playlists: PlaylistMeta[] = [
  {
    id: "001",
    slug: "001",
    name: "t1566.com",
    folder: "playlist#001",
    m3u: "t1566.com.m3u",
  },
];
