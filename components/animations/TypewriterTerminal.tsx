"use client";

import { useEffect, useRef } from "react";
import styles from "./animations.module.css";

type Variant = "terminal" | "filetree" | "api";

interface Props {
  lines: string[];
  variant: Variant;
  delayFor: (index: number) => number;
  restartDelay: number;
}

export function TypewriterTerminal({ lines, variant, delayFor, restartDelay }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const output = ref.current;
    if (!output) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      output.innerHTML = lines.map((l) => `<div>${l || "&nbsp;"}</div>`).join("");
      return;
    }

    let index = 0;
    let timer: ReturnType<typeof setTimeout>;
    output.innerHTML = "";

    const step = () => {
      if (index >= lines.length) {
        timer = setTimeout(() => {
          output.innerHTML = "";
          index = 0;
          step();
        }, restartDelay);
        return;
      }
      const div = document.createElement("div");
      div.innerHTML = lines[index] || "&nbsp;";
      output.appendChild(div);
      const parent = output.parentElement;
      if (parent) parent.scrollTop = parent.scrollHeight;
      index++;
      timer = setTimeout(step, delayFor(index));
    };

    step();
    return () => clearTimeout(timer);
  }, [lines, delayFor, restartDelay]);

  return (
    <div className={`${styles.terminal} ${styles[variant]}`} aria-hidden="true">
      <div className={styles.body}>
        <div ref={ref} className={styles.lines} />
      </div>
    </div>
  );
}
