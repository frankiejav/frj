import type { Metadata } from "next";
import { NowPlaying } from "@/components/widgets/NowPlaying";
import { reading } from "@/data/reading";
import styles from "./listening.module.css";

export const metadata: Metadata = {
  title: "Listening & Reading",
  description: "What's on repeat and what's on the nightstand.",
};

const STATUS_LABEL: Record<string, string> = {
  reading: "reading",
  finished: "finished",
  queued: "queued",
};

export default function Listening() {
  return (
    <main className="wide">
      <header className={styles.intro}>
        <h1>Listening &amp; Reading</h1>
        <p>What&apos;s on repeat and what&apos;s on the nightstand.</p>
      </header>

      <div className={styles.columns}>
        <section>
          <h2 className={styles.colTitle}>On repeat</h2>
          <NowPlaying limit={10} />
        </section>

        <section>
          <h2 className={styles.colTitle}>On the nightstand</h2>
          <ul className={styles.books}>
            {reading.map((book) => (
              <li key={book.title} className={styles.book}>
                <div className={styles.bookHead}>
                  <span className={styles.bookTitle}>{book.title}</span>
                  <span className={styles.status} data-status={book.status}>
                    {STATUS_LABEL[book.status]}
                  </span>
                </div>
                <span className={styles.author}>{book.author}</span>
                {book.note && <span className={styles.note}>{book.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
