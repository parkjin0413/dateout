export { isValidDate, todayKst } from "@/lib/date-kst";

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
