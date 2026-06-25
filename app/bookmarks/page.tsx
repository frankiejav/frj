import type { Metadata } from "next";
import { bookmarks } from "@/data/bookmarks";
import styles from "./bookmarks.module.css";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "The tools, feeds, and references I keep coming back to.",
};

export default function Bookmarks() {
  return (
    <main className="wide">
      <header className={styles.intro}>
        <h1>Bookmarks</h1>
        <p>The tools I run, the feeds I read, and the references I keep open.</p>
      </header>

      {bookmarks.map((group) => (
        <section key={group.category} className={styles.group}>
          <h2 className={styles.groupTitle}>{group.category}</h2>
          {group.description && <p className={styles.groupDesc}>{group.description}</p>}
          <ul className={styles.list}>
            {group.items.map((item) => (
              <li key={item.href} className={styles.item}>
                <a href={item.href} target="_blank" rel="noreferrer" className={styles.link}>
                  {item.title}
                </a>
                {item.note && <span className={styles.note}>{item.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
