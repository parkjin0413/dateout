import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { buildMonthCountMap, daysInMonth, isValidDate, isValidYm, todayKst } from "@/lib/field-trip/date";
import { compareFieldTrips } from "@/lib/field-trip/dept";
import FieldTripCalendar from "@/components/main/field-trip/calendar";
import ScheduleTable from "@/components/main/field-trip/schedule-table";
import ScheduleCards from "@/components/main/field-trip/schedule-cards";

type Props = {
  searchParams: Promise<{ date?: string; ym?: string; year?: string }>;
};

export default async function FieldTripPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const params = await searchParams;
  const today = todayKst();
  const selectedDate = params.date && isValidDate(params.date) ? params.date : today;
  const ym = params.ym && isValidYm(params.ym) ? params.ym : selectedDate.slice(0, 7);

  const [year, month] = ym.split("-").map(Number);
  const monthFirst = `${ym}-01`;
  const monthLast = `${ym}-${String(daysInMonth(year, month)).padStart(2, "0")}`;

  const [{ data: monthRows }, { data: dayRows }] = await Promise.all([
    supabase.from("field_trips").select("trip_start, trip_end").lte("trip_start", monthLast).gte("trip_end", monthFirst),
    supabase.from("field_trips").select("*").lte("trip_start", selectedDate).gte("trip_end", selectedDate),
  ]);

  const countMap = buildMonthCountMap(monthRows ?? [], monthFirst, monthLast);
  const rows = (dayRows ?? []).slice().sort(compareFieldTrips);

  const csvYear = Number(params.year) || Number(todayKst().slice(0, 4));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">외근 현황</h1>
          <p className="mt-1 text-base text-[#6B6455]">
            {selectedDate === today && (
              <span className="mr-2 rounded bg-[#E3EFEC] px-1.5 py-0.5 text-sm text-[#0F5C56]">TODAY</span>
            )}
            {selectedDate}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form method="get" className="flex items-center gap-2">
            <input type="hidden" name="ym" value={ym} />
            <input
              type="date"
              name="date"
              defaultValue={selectedDate}
              className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none"
            />
            <button
              type="submit"
              className="rounded-lg border border-[#E7E2D2] px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
            >
              조회
            </button>
          </form>

          {isAdmin && (
            <>
              <form method="get" action="/field-trip/csv" className="flex items-center gap-2">
                <select
                  name="year"
                  defaultValue={csvYear}
                  className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none"
                >
                  {Array.from({ length: 9 }, (_, i) => Number(todayKst().slice(0, 4)) + 1 - i).map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-medium text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
                >
                  CSV
                </button>
              </form>
              <Link
                href={`/field-trip/stats?year=${csvYear}`}
                className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-medium text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
              >
                통계
              </Link>
            </>
          )}

          <Link
            href={`/field-trip/new?date=${selectedDate}`}
            className="rounded-lg bg-[#0F5C56] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
          >
            내 외근 입력
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <ScheduleTable rows={rows} viewerId={user.id} isAdmin={isAdmin} date={selectedDate} ym={ym} />
          <ScheduleCards rows={rows} viewerId={user.id} isAdmin={isAdmin} date={selectedDate} ym={ym} />
        </div>

        <FieldTripCalendar ym={ym} selectedDate={selectedDate} today={today} countMap={countMap} />
      </div>
    </div>
  );
}
