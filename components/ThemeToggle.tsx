"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const label = !mounted ? " " : isDark ? "[light]" : "[dark]";

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label="Toggle color theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {label}
    </button>
  );
}
