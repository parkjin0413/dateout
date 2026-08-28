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
    <div className="rounded-2xl border border-[#E7E2D2] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <Link
          href={`/field-trip?ym=${prevYm}&date=${selectedDate}`}
          aria-label="이전 달"
          className="rounded-lg px-2 py-1 text-[#6B6455] transition-colors hover:bg-[#F5F3EA] hover:text-[#211D14]"
        >
          ◀
        </Link>
        <div className="text-base font-semibold text-[#211D14]">
          {year}년 {String(month).padStart(2, "0")}월
        </div>
        <Link
          href={`/field-trip?ym=${nextYm}&date=${selectedDate}`}
          aria-label="다음 달"
          className="rounded-lg px-2 py-1 text-[#6B6455] transition-colors hover:bg-[#F5F3EA] hover:text-[#211D14]"
        >
          ▶
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm text-[#8A8270]">
        {DOW.map((d, i) => (
          <div key={d} className={i === 0 ? "text-red-500" : i === 6 ? "text-blue-600" : ""}>
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
                isSelected ? "border-[#0F5C56]/40 bg-[#E3EFEC]" : "border-transparent hover:bg-[#F5F3EA]",
                isToday ? "ring-1 ring-[#0F5C56]/60" : "",
              ].join(" ")}
            >
              <span className={weekday === 0 ? "text-red-500" : weekday === 6 ? "text-blue-600" : "text-[#4B4739]"}>
                {day}
              </span>
              {count > 0 && (
                <span className="rounded-full bg-[#E3EFEC] px-1.5 text-xs leading-4 text-[#0F5C56]">{count}건</span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link
          href={`/field-trip?ym=${today.slice(0, 7)}&date=${today}`}
          className="text-sm text-[#6B6455] transition-colors hover:text-[#211D14]"
        >
          오늘로
        </Link>
      </div>
    </div>
  );
};

export default FieldTripCalendar;
