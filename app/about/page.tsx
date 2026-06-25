import type { Metadata } from "next";
import { ApiAnimation } from "@/components/animations/ApiAnimation";
import { contacts, socials } from "@/data/profile";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "nairobi — information security and threat intelligence.",
};

export default function About() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <ApiAnimation />
        </div>
        <article className={styles.content}>
          <h1>About</h1>

          <div className={styles.bio}>
            <p>
              I&apos;m nairobi. I work in information security and threat
              intelligence — mostly pulling apart phishing kits, processing
              infostealer logs, and writing up the interesting parts. I keep my
              real name off the internet on purpose.
            </p>
            <p>
              This site is the personal version of all that — the writing, the
              music I have on repeat, photos, and the links I keep coming back
              to. Think of it as a slower, quieter feed.
            </p>
          </div>

          <h2>Elsewhere</h2>
          <ul className={styles.linkList}>
            {socials.map((s) => (
              <li key={s.label}>
                <span className={styles.label}>{s.label}:</span>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  {s.handle}
                </a>
              </li>
            ))}
          </ul>

          <h2>Contact</h2>
          <ul className={styles.linkList}>
            {contacts.map((c) => (
              <li key={c.label}>
                <span className={styles.label}>{c.label}:</span>
                <a
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                >
                  {c.value}
                </a>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
