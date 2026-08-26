const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value: string): boolean {
  return DATE_RE.test(value);
}

// KST is a fixed UTC+9 offset (no DST), so formatting "now" against that
// time zone gives the correct local calendar date regardless of where the
// server process itself runs (e.g. a UTC serverless runtime).
export function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

// timestamptz -> "2026. 8. 20." (KST calendar date, matches the source CRM's display format)
export function formatKstDate(isoTimestamp: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" })
    .formatToParts(new Date(isoTimestamp))
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${parts.year}. ${Number(parts.month)}. ${Number(parts.day)}.`;
}

// "YYYY-MM-DD" date-only strings (both already calendar dates, no timezone conversion needed)
export function formatRelativeDays(dateStr: string, todayStr: string): string {
  const diffDays = Math.round((Date.parse(todayStr) - Date.parse(dateStr)) / 86400000);
  if (diffDays <= 0) return "오늘";
  if (diffDays < 30) return `${diffDays}일 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}
