import Link from "next/link";

import { addMonths, daysInMonth, firstWeekday } from "@/lib/field-trip/date";

type Props = {
  ym: string;
  selectedDate: string;
  today: string;
  countMap: Record<string, number>;
};

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

const FieldTripCalendar = ({ ym, selectedDate, today, countMap }: Props) => {
  const [year, month] = ym.split("-").map(Number);
  const total = daysInMonth(year, month);
  const firstW = firstWeekday(year, month);
  const prevYm = addMonths(ym, -1);
  const nextYm = addMonths(ym, 1);

  const cells: (number | null)[] = [
    ...Array.from({ length: firstW }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/field-trip?ym=${prevYm}&date=${selectedDate}`}
          className="rounded-lg px-2 py-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          ◀
        </Link>
        <div className="text-base font-semibold text-white">
          {year}년 {String(month).padStart(2, "0")}월
        </div>
        <Link
          href={`/field-trip?ym=${nextYm}&date=${selectedDate}`}
          className="rounded-lg px-2 py-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          ▶
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500">
        {DOW.map((d, i) => (
          <div key={d} className={i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : ""}>
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const dateStr = `${ym}-${String(day).padStart(2, "0")}`;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const count = countMap[dateStr] ?? 0;
          const weekday = (firstW + day - 1) % 7;

          return (
            <Link
              key={dateStr}
              href={`/field-trip?ym=${ym}&date=${dateStr}`}
              className={[
                "flex flex-col items-center gap-0.5 rounded-lg border py-1.5 text-sm transition-colors",
                isSelected ? "border-purple-400/50 bg-purple-500/15" : "border-transparent hover:bg-white/5",
                isToday ? "ring-1 ring-purple-400/60" : "",
              ].join(" ")}
            >
              <span className={weekday === 0 ? "text-red-400" : weekday === 6 ? "text-blue-400" : "text-gray-300"}>
                {day}
              </span>
              {count > 0 && (
                <span className="rounded-full bg-purple-500/20 px-1.5 text-xs leading-4 text-purple-300">
                  {count}건
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link
          href={`/field-trip?ym=${today.slice(0, 7)}&date=${today}`}
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          오늘로
        </Link>
      </div>
    </div>
  );
};

export default FieldTripCalendar;
