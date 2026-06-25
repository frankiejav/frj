export function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function toISO(input: string | Date): string {
  return (typeof input === "string" ? new Date(input) : input).toISOString();
}
