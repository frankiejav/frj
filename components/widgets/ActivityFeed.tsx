import { getRecentActivity } from "@/lib/services/activity";
import { formatDate } from "@/lib/format";
import styles from "./widgets.module.css";

export async function ActivityFeed({ limit = 5 }: { limit?: number }) {
  const { data, live } = await getRecentActivity(limit);

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHead}>
        <h2 className={styles.widgetTitle}>activity</h2>
        <span className={styles.badge} data-live={live}>
          {live ? "github" : "sample"}
        </span>
      </div>
      <ul className={styles.list}>
        {data.map((item) => (
          <li key={item.id} className={styles.row}>
            <span className={styles.rowMain}>
              {item.url ? (
                <a href={item.url} target={item.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  <strong>{item.title}</strong>
                </a>
              ) : (
                <strong>{item.title}</strong>
              )}
              {item.detail && <span> — {item.detail}</span>}
            </span>
            <span className={styles.rowMeta}>{formatDate(item.at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
