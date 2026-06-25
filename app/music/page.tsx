import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MusicLibrary } from "@/components/MusicLibrary";
import { getAllPlaylists } from "@/lib/playlists";
import styles from "./music.module.css";

export const metadata: Metadata = {
  title: "Music",
  description: "Playlists — what's on repeat.",
};

export default async function MusicPage() {
  const playlists = await getAllPlaylists();
  if (playlists.length === 0) notFound();

  return (
    <main className="wide">
      <header className={styles.intro}>
        <h1>Music</h1>
      </header>

      <MusicLibrary playlists={playlists} />
    </main>
  );
}
