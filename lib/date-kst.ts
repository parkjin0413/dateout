const KST_TIME_ZONE = "Asia/Seoul";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const YM_RE = /^\d{4}-\d{2}$/;

export function isValidDate(value: string): boolean {
  return DATE_RE.test(value);
}

export function isValidYm(value: string): boolean {
  return YM_RE.test(value);
}

// KST is a fixed UTC+9 offset (no DST), so formatting "now" against that
// time zone gives the correct local calendar date regardless of where the
// server process itself runs (e.g. a UTC serverless runtime).
export function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KST_TIME_ZONE }).format(new Date());
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function firstWeekday(year: number, month: number): number {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

export function addMonths(ym: string, delta: number): string {
  const [year, month] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatISODate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function enumerateDates(start: string, end: string): string[] {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);

  const dates: string[] = [];
  let cursor = Date.UTC(sy, sm - 1, sd);
  const last = Date.UTC(ey, em - 1, ed);

  while (cursor <= last) {
    const d = new Date(cursor);
    dates.push(formatISODate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()));
    cursor += 86_400_000;
  }

  return dates;
}
