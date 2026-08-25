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
