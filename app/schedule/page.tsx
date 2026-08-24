import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { buildMonthItemMap, daysInMonth, isValidDate, isValidYm, todayKst } from "@/lib/schedule/date";
import { getHolidays } from "@/lib/schedule/holidays";
import { DEPARTMENT_OPTIONS, DEPT_COLORS_LIGHT, compareSchedules, getDeptClass } from "@/lib/schedule/dept";
import MonthCalendar from "@/components/main/schedule/month-calendar";

type Props = {
  searchParams: Promise<{ date?: string; ym?: string; year?: string; month?: string; dept?: string }>;
};

const StatIcon = ({ kind }: { kind: "calendar" | "building" | "notice" }) => {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "calendar")
    return (
      <svg {...common} className="h-5 w-5">
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      </svg>
    );
  if (kind === "building")
    return (
      <svg {...common} className="h-5 w-5">
        <path d="M5 20V5.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V20" />
        <path d="M13 20V10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10" />
        <path d="M8 8h1M8 11.5h1M8 15h1" />
      </svg>
    );
  return (
    <svg {...common} className="h-5 w-5">
      <path d="M4 5.5h13l3 3.5-3 3.5H4z" />
      <path d="M4 5.5v13" />
    </svg>
  );
};

const StatCard = ({ label, value, icon }: { label: string; value: number; icon: "calendar" | "building" | "notice" }) => (
  <div className="rounded-2xl border border-[#E7E2D2] bg-white p-4">
    <div className="flex items-start justify-between gap-2 text-[#8A8270]">
      <span className="break-keep text-sm font-medium">{label}</span>
      <StatIcon kind={icon} />
    </div>
    <div className="mt-1.5 font-mono text-3xl font-bold text-[#211D14]">{value}</div>
  </div>
);

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

  const dept = params.dept && (DEPARTMENT_OPTIONS as readonly string[]).includes(params.dept) ? params.dept : null;

  const [year, month] = ym.split("-").map(Number);
  const monthFirst = `${ym}-01`;
  const monthLast = `${ym}-${String(daysInMonth(year, month)).padStart(2, "0")}`;

  const { data: monthRows } = await supabase
    .from("schedules")
    .select("id, department, content, trip_start, trip_end, created_at")
    .lte("trip_start", monthLast)
    .gte("trip_end", monthFirst);

  const allRows = monthRows ?? [];
  const filteredRows = dept ? allRows.filter((r) => r.department === dept) : allRows;

  const deptCounts = new Map<string, number>();
  for (const row of allRows) deptCounts.set(row.department, (deptCounts.get(row.department) ?? 0) + 1);

  const participatingDepts = DEPARTMENT_OPTIONS.filter((opt) => opt !== "공지" && (deptCounts.get(opt) ?? 0) > 0).length;
  const noticeCount = deptCounts.get("공지") ?? 0;

  const itemsByDate = buildMonthItemMap(filteredRows, monthFirst, monthLast);
  for (const items of Object.values(itemsByDate)) {
    items.sort(compareSchedules);
  }

  const holidays = getHolidays(year, month);
  const baseHref = `/schedule?ym=${ym}&date=${selectedDate}`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">연간 일정</h1>
          <p className="mt-1 text-base text-[#6B6455]">회사 공지·연차·현장 일정을 한눈에 확인하세요.</p>
        </div>
        <Link
          href={`/schedule/new?date=${selectedDate}`}
          className="flex items-center rounded-xl bg-[#0F5C56] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
        >
          + 일정 등록
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard label="이번 달 일정" value={allRows.length} icon="calendar" />
        <StatCard label="참여 부서" value={participatingDepts} icon="building" />
        <StatCard label="공지 일정" value={noticeCount} icon="notice" />
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="rounded-2xl border border-[#E7E2D2] bg-white p-3">
          <div className="mb-1.5 px-2 pt-1 text-sm font-semibold text-[#8A8270]">부서 필터</div>
          <div className="flex flex-col gap-0.5">
            <Link
              href={baseHref}
              className={[
                "flex items-center justify-between rounded-xl px-3 py-2 text-base font-medium transition-colors",
                !dept ? "bg-[#E3EFEC] text-[#0F5C56]" : "text-[#4B4739] hover:bg-[#F5F3EA]",
              ].join(" ")}
            >
              전체
              <span className="font-mono text-sm">{allRows.length}</span>
            </Link>
            {DEPARTMENT_OPTIONS.map((opt) => {
              const colors = DEPT_COLORS_LIGHT[getDeptClass(opt)];
              const active = dept === opt;
              return (
                <Link
                  key={opt}
                  href={`${baseHref}&dept=${encodeURIComponent(opt)}`}
                  className={[
                    "flex items-center justify-between rounded-xl px-3 py-2 text-base font-medium transition-colors",
                    active ? "bg-[#E3EFEC] text-[#0F5C56]" : "text-[#4B4739] hover:bg-[#F5F3EA]",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                    {opt}
                  </span>
                  <span className="font-mono text-sm">{deptCounts.get(opt) ?? 0}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <MonthCalendar ym={ym} today={today} selectedDate={selectedDate} dept={dept} holidays={holidays} itemsByDate={itemsByDate} />
      </div>
    </div>
  );
}
