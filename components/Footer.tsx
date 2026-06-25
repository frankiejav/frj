import { SITE_NAME } from "@/lib/consts";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.divider}>* * *</p>
        <p>&copy; {year} {SITE_NAME}</p>
      </div>
    </footer>
  );
}
