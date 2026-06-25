import { posts as allPosts, type Post } from "@/.velite";

export type { Post };

export function getPosts(): Post[] {
  return allPosts
    .filter((p) => !p.draft)
    .sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));
}

export function getPost(slug: string): Post | undefined {
  return allPosts.find((p) => p.slug === slug && !p.draft);
}
