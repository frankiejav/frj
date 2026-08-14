import Link from "next/link";
import { SITE_TITLE } from "@/lib/consts";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <span className={styles.brand}>
          <Link href="/">{SITE_TITLE}</Link>
        </span>
        <div className={styles.actions}>
          <Link href="/blog" className={styles.navLink}>
            [blog]
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
