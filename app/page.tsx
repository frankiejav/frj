import { contacts } from "@/data/contact";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.home}>
      <h1 className={styles.name}>Francisco "Frankie" Garcia</h1>

      <ul className={styles.contacts}>
        {contacts.map((item) => (
          <li
            key={item.label}
            className={item.preformatted ? styles.pgpRow : undefined}
          >
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
            ) : item.preformatted && item.placeholder ? (
              <div className={styles.pgpScroll}>
                <pre className={styles.pgpKey}>{item.placeholder}</pre>
              </div>
            ) : (
              <span className={styles.placeholder}>{item.placeholder}</span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
