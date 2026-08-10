// 양력 고정 공휴일 (MM-DD -> 명칭)
const FIXED_HOLIDAYS: Record<string, string> = {
  "01-01": "신정",
  "03-01": "삼일절",
  "05-01": "노동절",
  "05-05": "어린이날",
  "06-06": "현충일",
  "08-15": "광복절",
  "10-03": "개천절",
  "10-09": "한글날",
  "12-25": "성탄절",
};

// 대체공휴일 적용 대상(관행적으로 적용되는 항목)
const SUBSTITUTE_TARGETS = ["03-01", "05-05", "08-15", "10-03", "10-09"];

// 음력 명절, 선거일 등 고정 규칙으로 산출할 수 없는 일정은 연도별로 직접 추가한다.
const MANUAL_OVERRIDES: Record<number, Record<string, string[]>> = {
  2026: {
    "2026-02-16": ["설날 연휴"],
    "2026-02-17": ["설날"],
    "2026-02-18": ["설날 연휴"],
    "2026-05-24": ["부처님오신날"],
    "2026-05-25": ["부처님오신날 대체공휴일"],
    "2026-06-03": ["지방선거"],
    "2026-09-24": ["추석 연휴"],
    "2026-09-25": ["추석"],
    "2026-09-26": ["추석 연휴"],
  },
};

function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

export function getHolidays(year: number, month: number): Record<string, string[]> {
  const yearHolidays: Record<string, string[]> = {};

  for (const [md, name] of Object.entries(FIXED_HOLIDAYS)) {
    const date = `${year}-${md}`;
    (yearHolidays[date] ??= []).push(name);
  }

  for (const [date, names] of Object.entries(MANUAL_OVERRIDES[year] ?? {})) {
    const bucket = (yearHolidays[date] ??= []);
    for (const name of names) {
      if (!bucket.includes(name)) bucket.push(name);
    }
  }

  // 대상 공휴일이 주말과 겹치면, 겹치지 않는 다음 평일을 대체공휴일로 지정한다.
  for (const md of SUBSTITUTE_TARGETS) {
    const source = `${year}-${md}`;
    if (weekdayOf(source) !== 0 && weekdayOf(source) !== 6) continue;

    let candidate = source;
    for (let i = 0; i < 14; i++) {
      candidate = addDays(candidate, 1);
      const w = weekdayOf(candidate);
      if (w === 0 || w === 6) continue;
      if (yearHolidays[candidate]?.length) continue;
      (yearHolidays[candidate] ??= []).push("대체공휴일");
      break;
    }
  }

  const mm = String(month).padStart(2, "0");
  const monthHolidays: Record<string, string[]> = {};
  for (const [date, names] of Object.entries(yearHolidays)) {
    if (date.slice(0, 4) !== String(year) || date.slice(5, 7) !== mm) continue;
    monthHolidays[date] = names;
  }

  return monthHolidays;
}
