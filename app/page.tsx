import Link from "next/link";
import { contacts } from "@/data/contact";
import { getPosts } from "@/lib/posts";
import { FormattedDate } from "@/components/FormattedDate";
import styles from "./home.module.css";

export default function Home() {
  const posts = getPosts().slice(0, 3);

  return (
    <main className={`wide ${styles.home}`} id="content" tabIndex={-1}>
      <div className={styles.top}>
        <section className={styles.intro}>
          <h1 className={styles.name}>
            <strong>Francisco &ldquo;Frankie&rdquo; Garcia</strong>.
          </h1>
          <p className={styles.introLine}>
            I&apos;m an <strong>IT student</strong> with hands-on experience in{" "}
            <strong>information security</strong>,{" "}
            <strong>Windows/Linux systems</strong>, and{" "}
            <strong>self-hosted infrastructure</strong>.
          </p>
        </section>

      <ul className={styles.contacts}>
        {contacts.map((item) => (
          <li key={item.label}>
            <span className={styles.label}>{item.label}</span>
            {item.href && item.value ? (
              <a
                className={item.external ? styles.contactLink : undefined}
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.value}
              </a>
            ) : (
              <span className={styles.placeholder}>{item.placeholder}</span>
            )}
          </li>
        ))}
      </ul>
      </div>

      {posts.length > 0 && (
        <section className={styles.recent}>
          <h2 className={styles.recentHeading}>recent posts</h2>
          <ul className={styles.posts}>
            {posts.map((post) => (
              <li key={post.slug}>
                <span className={styles.postDate}>
                  <FormattedDate date={post.pubDate} />
                </span>
                <Link href={post.permalink} className={styles.postLink}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
