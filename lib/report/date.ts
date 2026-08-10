const KST_TIME_ZONE = "Asia/Seoul";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function isValidDate(value: string): boolean {
  return DATE_RE.test(value);
}

// KST is a fixed UTC+9 offset (no DST), so formatting "now" against that
// time zone gives the correct local calendar date regardless of where the
// server process itself runs (e.g. a UTC serverless runtime).
export function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KST_TIME_ZONE }).format(new Date());
}

// "2026-08-07" -> "2026년 8월 7일(금)"
export function formatKoreanDateTitle(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${y}년 ${m}월 ${d}일(${WEEKDAYS[weekday]})`;
}
