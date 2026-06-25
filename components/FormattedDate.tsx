import { formatDate, toISO } from "@/lib/format";

export function FormattedDate({ date }: { date: string | Date }) {
  return <time dateTime={toISO(date)}>{formatDate(date)}</time>;
}
