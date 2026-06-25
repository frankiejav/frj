import { getRecentTracks } from "@/lib/services/music";
import { formatDate } from "@/lib/format";
import styles from "./widgets.module.css";

export async function NowPlaying({ limit = 5 }: { limit?: number }) {
  const { data, live } = await getRecentTracks(limit);

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHead}>
        <h2 className={styles.widgetTitle}>listening</h2>
        <span className={styles.badge} data-live={live}>
          {live ? "last.fm" : "sample"}
        </span>
      </div>
      <ul className={styles.list}>
        {data.map((track, i) => (
          <li key={`${track.title}-${i}`} className={styles.row}>
            <span className={styles.rowMain}>
              {track.nowPlaying && <span className={styles.pulse} aria-hidden="true" />}
              <strong>{track.title}</strong> — {track.artist}
            </span>
            <span className={styles.rowMeta}>
              {track.nowPlaying ? "now" : track.playedAt ? formatDate(track.playedAt) : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
