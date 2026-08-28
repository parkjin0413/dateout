export { isValidDate, todayKst } from "@/lib/date-kst";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// "2026-08-07" -> "2026년 8월 7일(금)"
export function formatKoreanDateTitle(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${y}년 ${m}월 ${d}일(${WEEKDAYS[weekday]})`;
}
