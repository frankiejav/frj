import { SITE_NAME } from "@/lib/consts";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.divider}>* * *</p>
        <p>&copy; {year} {SITE_NAME}</p>
        <p className={styles.hosted}>
          Self-hosted on a VPS running{" "}
          <a href="https://www.debian.org/" target="_blank" rel="noreferrer">
            Debian
          </a>
        </p>
      </div>
    </footer>
  );
}
