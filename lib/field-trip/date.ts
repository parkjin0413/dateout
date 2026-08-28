export { isValidDate, isValidYm, todayKst, daysInMonth, firstWeekday, addMonths, enumerateDates } from "@/lib/date-kst";

import { enumerateDates } from "@/lib/date-kst";

export function buildMonthCountMap(
  rows: { trip_start: string; trip_end: string }[],
  monthFirst: string,
  monthLast: string
): Record<string, number> {
  const map: Record<string, number> = {};

  for (const row of rows) {
    const start = row.trip_start < monthFirst ? monthFirst : row.trip_start;
    const end = row.trip_end > monthLast ? monthLast : row.trip_end;
    if (start > end) continue;

    for (const day of enumerateDates(start, end)) {
      map[day] = (map[day] ?? 0) + 1;
    }
  }

  return map;
}
