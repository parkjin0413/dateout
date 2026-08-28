export { isValidDate, isValidYm, todayKst, daysInMonth, firstWeekday, addMonths, enumerateDates } from "@/lib/date-kst";

import { enumerateDates } from "@/lib/date-kst";

export function buildMonthItemMap<T extends { trip_start: string; trip_end: string }>(
  rows: T[],
  monthFirst: string,
  monthLast: string
): Record<string, T[]> {
  const map: Record<string, T[]> = {};

  for (const row of rows) {
    const start = row.trip_start < monthFirst ? monthFirst : row.trip_start;
    const end = row.trip_end > monthLast ? monthLast : row.trip_end;
    if (start > end) continue;

    for (const day of enumerateDates(start, end)) {
      map[day] ??= [];
      map[day].push(row);
    }
  }

  return map;
}
