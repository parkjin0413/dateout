import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { buildMonthItemMap, daysInMonth, isValidDate, isValidYm, todayKst } from "@/lib/schedule/date";
import { getHolidays } from "@/lib/schedule/holidays";
import { compareSchedules } from "@/lib/schedule/dept";
import MonthCalendar from "@/components/main/schedule/month-calendar";

type Props = {
  searchParams: Promise<{ date?: string; ym?: string; year?: string; month?: string }>;
};

export default async function SchedulePage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const params = await searchParams;
  const today = todayKst();
  const selectedDate = params.date && isValidDate(params.date) ? params.date : today;

  const yearParam = Number(params.year);
  const monthParam = Number(params.month);
  const hasYearMonth = Number.isInteger(yearParam) && monthParam >= 1 && monthParam <= 12;

  const ym = hasYearMonth
    ? `${yearParam}-${String(monthParam).padStart(2, "0")}`
    : params.ym && isValidYm(params.ym)
      ? params.ym
      : selectedDate.slice(0, 7);

  const [year, month] = ym.split("-").map(Number);
  const monthFirst = `${ym}-01`;
  const monthLast = `${ym}-${String(daysInMonth(year, month)).padStart(2, "0")}`;

  const { data: monthRows } = await supabase
    .from("schedules")
    .select("id, department, content, trip_start, trip_end, created_at")
    .lte("trip_start", monthLast)
    .gte("trip_end", monthFirst);

  const itemsByDate = buildMonthItemMap(monthRows ?? [], monthFirst, monthLast);
  for (const items of Object.values(itemsByDate)) {
    items.sort(compareSchedules);
  }

  const holidays = getHolidays(year, month);

  return (
    <div className="relative min-h-screen w-full bg-[#181818]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-32 sm:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">연간 일정</h1>
          <p className="mt-1 text-base text-gray-400">회사 공지·연차·현장 일정을 한눈에 확인하세요.</p>
        </div>

        <MonthCalendar ym={ym} today={today} selectedDate={selectedDate} holidays={holidays} itemsByDate={itemsByDate} />
      </div>
    </div>
  );
}
