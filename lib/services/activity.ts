import type { Activity, ServiceResult } from "./types";

const SAMPLE_ACTIVITY: Activity[] = [
  {
    id: "sample-1",
    kind: "post",
    title: "Published: Inside an Exodus Wallet Phishing Kit",
    detail: "MiCA lures, VM bytecode, and a Telegram exfil relay",
    url: "/blog/exodus-mica-phishing-kit-analysis",
    at: "2026-05-26T00:00:00Z",
  },
  {
    id: "sample-2",
    kind: "commit",
    title: "Pushed to t1566/site",
    detail: "port site from Astro to Next.js",
    at: "2026-06-24T18:00:00Z",
  },
  {
    id: "sample-3",
    kind: "star",
    title: "Starred velitejs/velite",
    detail: "type-safe content layer",
    at: "2026-06-23T12:30:00Z",
  },
];

interface GithubEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: {
    commits?: { message: string }[];
    release?: { name: string; html_url: string };
  };
  created_at: string;
}

/**
 * Recent GitHub activity. Set GITHUB_USERNAME (and optionally GITHUB_TOKEN) to go live.
 * Falls back to sample data so the UI is always populated.
 */
export async function getRecentActivity(limit = 6): Promise<ServiceResult<Activity[]>> {
  const username = process.env.GITHUB_USERNAME;

  if (!username) {
    return { data: SAMPLE_ACTIVITY.slice(0, limit), live: false, source: "sample" };
  }

  try {
    const headers: HeadersInit = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=${limit}`,
      { headers, next: { revalidate: 600 } },
    );
    if (!res.ok) throw new Error(`GitHub ${res.status}`);

    const events = (await res.json()) as GithubEvent[];

    const data: Activity[] = events.slice(0, limit).map((e) => {
      const repoUrl = `https://github.com/${e.repo.name}`;
      if (e.type === "PushEvent") {
        return {
          id: e.id,
          kind: "commit",
          title: `Pushed to ${e.repo.name}`,
          detail: e.payload.commits?.[0]?.message,
          url: repoUrl,
          at: e.created_at,
        };
      }
      if (e.type === "ReleaseEvent") {
        return {
          id: e.id,
          kind: "release",
          title: `Released ${e.payload.release?.name ?? ""} in ${e.repo.name}`,
          url: e.payload.release?.html_url ?? repoUrl,
          at: e.created_at,
        };
      }
      if (e.type === "WatchEvent") {
        return { id: e.id, kind: "star", title: `Starred ${e.repo.name}`, url: repoUrl, at: e.created_at };
      }
      return { id: e.id, kind: "repo", title: `${e.type} on ${e.repo.name}`, url: repoUrl, at: e.created_at };
    });

    return { data, live: true, source: "github" };
  } catch {
    return { data: SAMPLE_ACTIVITY.slice(0, limit), live: false, source: "sample" };
  }
}
