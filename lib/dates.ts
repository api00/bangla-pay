// Date helpers — keep formatting consistent across dashboards.

const TZ_DHAKA = "Asia/Dhaka";

const RELATIVE_TIME = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const DATE_LONG = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TZ_DHAKA,
});

const DATE_SHORT = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
  timeZone: TZ_DHAKA,
});

const DATE_DAY = new Intl.DateTimeFormat("en-BD", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: TZ_DHAKA,
});

/** "Apr 27, 2026, 3:42 PM" */
export function formatBdtDateTime(date: Date): string {
  return DATE_LONG.format(date);
}

/** "Apr 27, 2026" */
export function formatBdtDate(date: Date): string {
  return DATE_SHORT.format(date);
}

/** "Mon, 27 Apr" — for chart axes. */
export function formatBdtDayLabel(date: Date): string {
  return DATE_DAY.format(date);
}

/** "just now" / "3 hours ago" / "2 weeks ago" */
export function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return RELATIVE_TIME.format(-Math.floor(diff / 60), "minute");
  if (diff < 86_400)
    return RELATIVE_TIME.format(-Math.floor(diff / 3_600), "hour");
  if (diff < 7 * 86_400)
    return RELATIVE_TIME.format(-Math.floor(diff / 86_400), "day");
  if (diff < 30 * 86_400)
    return RELATIVE_TIME.format(-Math.floor(diff / (7 * 86_400)), "week");
  return RELATIVE_TIME.format(-Math.floor(diff / (30 * 86_400)), "month");
}
