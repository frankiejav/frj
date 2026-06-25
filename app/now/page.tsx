import type { Metadata } from "next";
import { now } from "@/data/profile";
import { FormattedDate } from "@/components/FormattedDate";
import styles from "./now.module.css";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm focused on right now.",
};

export default function Now() {
  return (
    <main>
      <header className={styles.intro}>
        <h1>Now</h1>
        <p className={styles.updated}>
          Updated <FormattedDate date={now.updated} />
        </p>
        <p>{now.intro}</p>
      </header>

      <section>
        {now.items.map((item) => (
          <div key={item.heading} className={styles.item}>
            <h2 className={styles.heading}>{item.heading}</h2>
            <p>{item.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
