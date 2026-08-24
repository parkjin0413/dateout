import Link from "next/link";

import { addMonths, daysInMonth, firstWeekday } from "@/lib/schedule/date";
import { DEPT_COLORS_LIGHT, getDeptClass } from "@/lib/schedule/dept";
import type { Schedule } from "@/lib/schedule/types";

type ScheduleItem = Pick<Schedule, "id" | "department" | "content">;

type Props = {
  ym: string;
  today: string;
  selectedDate: string;
  dept: string | null;
  holidays: Record<string, string[]>;
  itemsByDate: Record<string, ScheduleItem[]>;
};

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

const MonthCalendar = ({ ym, today, selectedDate, dept, holidays, itemsByDate }: Props) => {
  const [year, month] = ym.split("-").map(Number);
  const total = daysInMonth(year, month);
  const firstW = firstWeekday(year, month);
  const prevYm = addMonths(ym, -1);
  const nextYm = addMonths(ym, 1);
  const currentYear = new Date().getUTCFullYear();
  const deptQuery = dept ? `&dept=${encodeURIComponent(dept)}` : "";

  const cells: (number | null)[] = [
    ...Array.from({ length: firstW }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-2xl border border-[#E7E2D2] bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link
            href={`/schedule?ym=${prevYm}&date=${selectedDate}${deptQuery}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B6455] transition-colors hover:bg-[#F5F3EA] hover:text-[#211D14]"
          >
            ◀
          </Link>
          <div className="min-w-[110px] text-center text-lg font-semibold text-[#211D14]">
            {year}년 {month}월
          </div>
          <Link
            href={`/schedule?ym=${nextYm}&date=${selectedDate}${deptQuery}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B6455] transition-colors hover:bg-[#F5F3EA] hover:text-[#211D14]"
          >
            ▶
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form method="get" action="/schedule" className="flex items-center gap-1.5">
            <input type="hidden" name="date" value={selectedDate} />
            {dept && <input type="hidden" name="dept" value={dept} />}
            <select
              name="year"
              defaultValue={year}
              className="rounded-lg border border-[#E7E2D2] bg-white px-2 py-1.5 text-sm text-[#211D14] outline-none"
            >
              {Array.from({ length: 9 }, (_, i) => currentYear + 1 - i).map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
            <select
              name="month"
              defaultValue={month}
              className="rounded-lg border border-[#E7E2D2] bg-white px-2 py-1.5 text-sm text-[#211D14] outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-1.5 text-sm font-medium text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
            >
              이동
            </button>
          </form>

          <Link
            href={`/schedule?ym=${today.slice(0, 7)}&date=${today}${deptQuery}`}
            className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-1.5 text-sm font-medium text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            오늘
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-semibold text-[#8A8270]">
        {DOW.map((d, i) => (
          <div key={d} className={i === 0 ? "text-red-500" : i === 6 ? "text-blue-600" : ""}>
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="min-h-[52px] rounded-lg sm:min-h-[64px] md:min-h-[88px]" />;

          const dateStr = `${ym}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === today;
          const weekday = (firstW + day - 1) % 7;
          const holidayNames = holidays[dateStr] ?? [];
          const isHoliday = holidayNames.length > 0;
          const items = itemsByDate[dateStr] ?? [];

          const dayColor = isHoliday || weekday === 0 ? "text-red-500" : weekday === 6 ? "text-blue-600" : "text-[#211D14]";

          return (
            <div
              key={dateStr}
              className="flex min-h-[52px] flex-col gap-1 rounded-lg border border-[#EDE7D3] p-1 sm:min-h-[64px] md:min-h-[88px]"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/schedule/day/${dateStr}?ym=${ym}`}
                  title={`${dateStr} 일정 보기`}
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isToday ? "bg-[#0F5C56] text-white" : `${dayColor} hover:bg-[#F5F3EA]`,
                  ].join(" ")}
                >
                  {day}
                </Link>
                {items.length > 0 && (
                  <Link
                    href={`/schedule/day/${dateStr}?ym=${ym}`}
                    className="hidden rounded-full bg-[#F5F3EA] px-1.5 text-xs leading-4 text-[#8A8270] transition-colors hover:bg-[#E3EFEC] hover:text-[#0F5C56] md:inline-flex"
                  >
                    {items.length}건
                  </Link>
                )}
              </div>

              {isHoliday && <div className="truncate text-xs text-red-500">{holidayNames.join(" · ")}</div>}

              {items.length > 0 && (
                <div className="md:hidden">
                  <Link
                    href={`/schedule/day/${dateStr}?ym=${ym}`}
                    className="inline-flex rounded-full bg-[#E3EFEC] px-1.5 py-0.5 text-[10px] font-semibold leading-4 text-[#0F5C56]"
                  >
                    {items.length}건
                  </Link>
                </div>
              )}

              <div className="hidden max-h-[100px] flex-col gap-1 overflow-y-auto md:flex">
                {items.map((item) => {
                  const colors = DEPT_COLORS_LIGHT[getDeptClass(item.department)];
                  return (
                    <Link
                      key={item.id}
                      href={`/schedule/day/${dateStr}?ym=${ym}`}
                      className={`truncate rounded border px-1.5 py-0.5 text-xs ${colors.bg} ${colors.text} ${colors.border}`}
                      title={item.content}
                    >
                      {item.content}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
