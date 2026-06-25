import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/posts";
import { FormattedDate } from "@/components/FormattedDate";
import { TerminalAnimation } from "@/components/animations/TerminalAnimation";
import { FileTreeAnimation } from "@/components/animations/FileTreeAnimation";
import { PhishingRedirectAnimation } from "@/components/animations/PhishingRedirectAnimation";
import { WebSocketSkimAnimation } from "@/components/animations/WebSocketSkimAnimation";
import styles from "./post.module.css";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: post.permalink },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: post.permalink,
      publishedTime: post.pubDate,
      modifiedTime: post.updatedDate,
    },
  };
}

function HeroAnimation({ animation }: { animation?: string }) {
  switch (animation) {
    case "phishing-redirect":
      return <PhishingRedirectAnimation />;
    case "websocket-skim":
      return <WebSocketSkimAnimation />;
    case "terminal":
      return <TerminalAnimation />;
    default:
      return <FileTreeAnimation />;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <main className="full">
      <article>
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <HeroAnimation animation={post.animation} />
          </div>
          <div className={styles.heroHeader}>
            <div className={styles.meta}>
              <FormattedDate date={post.pubDate} />
              {post.updatedDate && (
                <span className={styles.updated}>
                  {" "}
                  (Updated: <FormattedDate date={post.updatedDate} />)
                </span>
              )}
            </div>
            <h1>{post.title}</h1>
          </div>
        </section>
        <div
          className={`prose ${styles.prose}`}
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </article>
    </main>
  );
}
