import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section style={{ paddingBlock: "var(--spacing-xl)" }}>
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          404 · not found
        </p>
        <h1>This page wandered off.</h1>
        <p>
          Head back <Link href="/">home</Link>.
        </p>
      </section>
    </main>
  );
}
