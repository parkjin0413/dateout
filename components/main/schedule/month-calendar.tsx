import Link from "next/link";

import { addMonths, daysInMonth, firstWeekday } from "@/lib/schedule/date";
import { DEPARTMENT_OPTIONS, DEPT_COLORS, getDeptClass } from "@/lib/schedule/dept";
import type { Schedule } from "@/lib/schedule/types";

type ScheduleItem = Pick<Schedule, "id" | "department" | "content">;

type Props = {
  ym: string;
  today: string;
  selectedDate: string;
  holidays: Record<string, string[]>;
  itemsByDate: Record<string, ScheduleItem[]>;
};

const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const LEGEND = DEPARTMENT_OPTIONS.map((label) => ({ label, cls: getDeptClass(label) }));

const MonthCalendar = ({ ym, today, selectedDate, holidays, itemsByDate }: Props) => {
  const [year, month] = ym.split("-").map(Number);
  const total = daysInMonth(year, month);
  const firstW = firstWeekday(year, month);
  const prevYm = addMonths(ym, -1);
  const nextYm = addMonths(ym, 1);
  const currentYear = new Date().getUTCFullYear();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstW }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-lg shadow-black/40 backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/schedule?ym=${prevYm}&date=${selectedDate}`}
            className="rounded-lg px-2 py-1 text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-900"
          >
            ◀
          </Link>
          <div className="min-w-[130px] text-center text-lg font-semibold text-gray-900">
            {year}년 {month}월
          </div>
          <Link
            href={`/schedule?ym=${nextYm}&date=${selectedDate}`}
            className="rounded-lg px-2 py-1 text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-900"
          >
            ▶
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form method="get" action="/schedule" className="flex items-center gap-1.5">
            <input type="hidden" name="date" value={selectedDate} />
            <select
              name="year"
              defaultValue={year}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none"
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
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              이동
            </button>
          </form>

          <Link
            href={`/schedule?ym=${today.slice(0, 7)}&date=${today}`}
            className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            오늘
          </Link>
          <Link
            href={`/schedule/new?date=${selectedDate}`}
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
          >
            일정 입력
          </Link>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {LEGEND.map(({ label, cls }) => {
          const colors = DEPT_COLORS[cls];
          return (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${colors.bg} ${colors.text} ${colors.border}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {label}
            </span>
          );
        })}
      </div>

      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500">
          {DOW.map((d, i) => (
            <div key={d} className={i === 0 ? "text-red-600" : i === 6 ? "text-blue-600" : ""}>
              {d}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="rounded-lg bg-gray-50/60" />;

            const dateStr = `${ym}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === today;
            const weekday = (firstW + day - 1) % 7;
            const holidayNames = holidays[dateStr] ?? [];
            const isHoliday = holidayNames.length > 0;
            const items = itemsByDate[dateStr] ?? [];

            const dayColor = isHoliday || weekday === 0 ? "text-red-600" : weekday === 6 ? "text-blue-600" : "text-gray-700";

            return (
              <div
                key={dateStr}
                className={[
                  "flex min-h-[108px] flex-col gap-1 rounded-lg border p-1.5",
                  isToday ? "border-purple-300 bg-purple-50" : "border-gray-100",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/schedule/new?date=${dateStr}`}
                    title={`${dateStr} 일정 입력`}
                    className={`text-sm font-semibold ${dayColor} hover:underline`}
                  >
                    {day}
                  </Link>
                  {items.length > 0 && (
                    <span className="rounded-full bg-gray-100 px-1.5 text-xs leading-4 text-gray-600">
                      {items.length}
                    </span>
                  )}
                </div>

                {isHoliday && <div className="truncate text-xs text-red-600">{holidayNames.join(" · ")}</div>}

                <div className="flex max-h-[100px] flex-col gap-1 overflow-y-auto">
                  {items.map((item) => {
                    const colors = DEPT_COLORS[getDeptClass(item.department)];
                    return (
                      <Link
                        key={item.id}
                        href={`/schedule/${item.id}?ym=${ym}`}
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

      <div className="divide-y divide-gray-100 md:hidden">
        {Array.from({ length: total }, (_, i) => i + 1).map((day) => {
          const dateStr = `${ym}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === today;
          const weekday = (firstW + day - 1) % 7;
          const holidayNames = holidays[dateStr] ?? [];
          const isHoliday = holidayNames.length > 0;
          const items = itemsByDate[dateStr] ?? [];

          const dayColor = isHoliday || weekday === 0 ? "text-red-600" : weekday === 6 ? "text-blue-600" : "text-gray-700";

          return (
            <div
              key={dateStr}
              className={["flex gap-3 py-2.5", isToday ? "bg-purple-50" : ""].join(" ")}
            >
              <Link
                href={`/schedule/new?date=${dateStr}`}
                title={`${dateStr} 일정 입력`}
                className={`flex w-10 shrink-0 flex-col items-center text-sm font-semibold ${dayColor}`}
              >
                <span>{day}</span>
                <span className="text-[10px] font-normal text-gray-500">{DOW[weekday]}</span>
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
                {isHoliday && <div className="text-xs text-red-600">{holidayNames.join(" · ")}</div>}
                {items.length === 0 ? (
                  !isHoliday && <div className="text-xs text-gray-400">—</div>
                ) : (
                  items.map((item) => {
                    const colors = DEPT_COLORS[getDeptClass(item.department)];
                    return (
                      <Link
                        key={item.id}
                        href={`/schedule/${item.id}?ym=${ym}`}
                        className={`whitespace-normal break-words rounded border px-2 py-1 text-sm leading-snug ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {item.content}
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
