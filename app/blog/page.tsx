import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/posts";
import { FormattedDate } from "@/components/FormattedDate";
import styles from "./blog.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Long-form notes on information security, threat intelligence, and the occasional teardown.",
};

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <main className="wide">
      <header className={styles.intro}>
        <h1>Blog</h1>
        <p>
          Long-form teardowns and notes. Mostly information security and threat
          intelligence, written when something is worth writing down.
        </p>
      </header>

      <section>
        <ul className={styles.grid}>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={post.permalink} className={styles.card}>
                {post.heroImage && (
                  <img src={post.heroImage} alt="" width={720} height={360} />
                )}
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{post.title}</h2>
                  <p className={styles.cardDesc}>{post.description}</p>
                  <span className={styles.cardDate}>
                    <FormattedDate date={post.pubDate} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
