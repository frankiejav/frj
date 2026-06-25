import Link from "next/link";
import { SITE_TITLE } from "@/lib/consts";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <h2 className={styles.brand}>
          <Link href="/">{SITE_TITLE}</Link>
        </h2>
        <div className={styles.actions}>
          <Link href="/music" className={styles.navLink}>
            [music]
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
