import { SITE_NAME } from "@/lib/consts";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.divider}>* * *</p>
        <p className={styles.hosted}>
          <a href="/rss.xml">rss</a>  · 
          self-hosted on {" "}
          <a href="https://www.debian.org/" target="_blank" rel="noreferrer">
            debian{" "}
            <img
              src="/images/etc/120px-Openlogo-debianV2.svg.png"
              alt=""
              className={styles.debianLogo}
            />
          </a>
        </p>
      </div>
    </footer>
  );
}