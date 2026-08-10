import { enumerateDates } from "./date";
import { getDeptLabel, getDeptRank } from "./dept";

export type StatsSourceRow = {
  author_name: string;
  department: string;
  destination: string;
  base_date: string;
  trip_start: string;
  trip_end: string;
};

export type StatsResult = {
  totalDays: number;
  totalTrips: number;
  uniquePeople: number;
  topRegion: string;
  topRegionDays: number;
  monthDays: number[]; // index 0 = 1월 ... index 11 = 12월
  dayDays: Record<number, number> | null; // 특정 월 필터일 때만 채워짐 (key: 일)
  busyMonth: number;
  deptList: { dept: string; days: number; pct: number }[];
  personList: {
    name: string;
    days: number;
    trips: number;
    topRegions: { region: string; days: number }[];
  }[];
};

export function computeFieldTripStats(
  rows: StatsSourceRow[],
  rangeStart: string,
  rangeEnd: string,
  monthFilter: number | null
): StatsResult {
  const personDays: Record<string, Record<string, number>> = {};
  const personTrips: Record<string, number> = {};
  const personRegions: Record<string, Record<string, number>> = {};
  const deptDays: Record<string, number> = {};
  const regionDays: Record<string, number> = {};
  const monthDays = new Array(12).fill(0) as number[];
  const dayDays: Record<number, number> = {};

  let totalDays = 0;
  let totalTrips = 0;
  const peopleSet = new Set<string>();

  for (const row of rows) {
    const name = row.author_name.trim();
    const dept = getDeptLabel(row.department.trim()) || "미지정";
    const region = row.destination.trim();

    let s = row.trip_start || row.base_date;
    let e = row.trip_end || row.base_date;
    if (s < rangeStart) s = rangeStart;
    if (e > rangeEnd) e = rangeEnd;
    if (s > e) continue;

    peopleSet.add(name);
    totalTrips += 1;
    personTrips[name] = (personTrips[name] ?? 0) + 1;

    for (const day of enumerateDates(s, e)) {
      const [, m, d] = day.split("-").map(Number);
      totalDays += 1;
      monthDays[m - 1] += 1;
      if (monthFilter) dayDays[d] = (dayDays[d] ?? 0) + 1;

      personDays[name] ??= {};
      personDays[name][dept] = (personDays[name][dept] ?? 0) + 1;
      deptDays[dept] = (deptDays[dept] ?? 0) + 1;

      if (region) {
        personRegions[name] ??= {};
        personRegions[name][region] = (personRegions[name][region] ?? 0) + 1;
        regionDays[region] = (regionDays[region] ?? 0) + 1;
      }
    }
  }

  let topRegion = "";
  let topRegionDays = 0;
  for (const [region, days] of Object.entries(regionDays)) {
    if (days > topRegionDays) {
      topRegion = region;
      topRegionDays = days;
    }
  }

  let busyMonth = 1;
  let busyDays = 0;
  monthDays.forEach((days, idx) => {
    if (days > busyDays) {
      busyDays = days;
      busyMonth = idx + 1;
    }
  });

  const deptList = Object.entries(deptDays)
    .map(([dept, days]) => ({
      dept,
      days,
      pct: totalDays > 0 ? Math.round((days / totalDays) * 1000) / 10 : 0,
    }))
    .sort((a, b) => getDeptRank(a.dept) - getDeptRank(b.dept) || a.dept.localeCompare(b.dept, "ko"));

  const personList = Array.from(peopleSet)
    .map((name) => {
      const days = Object.values(personDays[name] ?? {}).reduce((sum, v) => sum + v, 0);
      const topRegions = Object.entries(personRegions[name] ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([region, regionDaysCount]) => ({ region, days: regionDaysCount }));
      return { name, days, trips: personTrips[name] ?? 0, topRegions };
    })
    .sort((a, b) => b.days - a.days || a.name.localeCompare(b.name, "ko"));

  return {
    totalDays,
    totalTrips,
    uniquePeople: peopleSet.size,
    topRegion,
    topRegionDays,
    monthDays,
    dayDays: monthFilter ? dayDays : null,
    busyMonth,
    deptList,
    personList,
  };
}
