import type { Metadata } from "next";
import Image from "next/image";
import { photos } from "@/data/photos";
import { FormattedDate } from "@/components/FormattedDate";
import styles from "./photos.module.css";

export const metadata: Metadata = {
  title: "Photos",
  description: "A gallery of photos — places, things, and moments worth keeping.",
};

export default function Photos() {
  return (
    <main className="wide">
      <header className={styles.intro}>
        <h1>Photos</h1>
        <p>
          A slow gallery of places and things. Sample placeholders for now — real
          shots to come.
        </p>
      </header>

      <section className={styles.grid}>
        {photos.map((photo) => (
          <figure key={photo.src} className={styles.figure}>
            <div className={styles.frame}>
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 720px) 100vw, (max-width: 960px) 50vw, 460px"
              />
            </div>
            {(photo.caption || photo.location || photo.date) && (
              <figcaption className={styles.caption}>
                {photo.caption && <span>{photo.caption}</span>}
                <span className={styles.meta}>
                  {photo.location}
                  {photo.location && photo.date ? " · " : ""}
                  {photo.date && <FormattedDate date={photo.date} />}
                </span>
              </figcaption>
            )}
          </figure>
        ))}
      </section>
    </main>
  );
}
