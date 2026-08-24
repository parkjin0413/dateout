import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { daysInMonth } from "@/lib/field-trip/date";
import { computeFieldTripStats } from "@/lib/field-trip/stats";

type Props = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

export default async function FieldTripStatsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/field-trip");

  const params = await searchParams;
  const currentYear = new Date().getUTCFullYear();
  const year = Number(params.year) || currentYear;
  const month = Number(params.month) || 0;
  const monthFilter = month >= 1 && month <= 12 ? month : null;

  const rangeStart = monthFilter ? `${year}-${String(monthFilter).padStart(2, "0")}-01` : `${year}-01-01`;
  const rangeEnd = monthFilter
    ? `${year}-${String(monthFilter).padStart(2, "0")}-${String(daysInMonth(year, monthFilter)).padStart(2, "0")}`
    : `${year}-12-31`;

  const { data: rows } = await supabase
    .from("field_trips")
    .select("author_name, department, destination, base_date, trip_start, trip_end")
    .lte("trip_start", rangeEnd)
    .gte("trip_end", rangeStart);

  const stats = computeFieldTripStats(rows ?? [], rangeStart, rangeEnd, monthFilter);

  const monthMax = Math.max(1, ...stats.monthDays);
  const dayEntries = stats.dayDays
    ? Array.from({ length: daysInMonth(year, monthFilter ?? 1) }, (_, i) => i + 1).map((d) => ({
        day: d,
        value: stats.dayDays?.[d] ?? 0,
      }))
    : [];
  const dayMax = Math.max(1, ...dayEntries.map((e) => e.value));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">외근 통계 요약</h1>
          <p className="mt-1 text-base text-[#6B6455]">
            관리자 전용 · {year}년{monthFilter ? ` ${monthFilter}월` : ""} (일자 기준 집계)
          </p>
        </div>

        <form method="get" className="flex items-center gap-2">
          <select
            name="year"
            defaultValue={year}
            className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none"
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
            className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none"
          >
            <option value={0}>전체</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg border border-[#E7E2D2] px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            조회
          </button>
          <Link
            href={`/field-trip/csv?year=${year}`}
            className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-medium text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            CSV
          </Link>
          <Link
            href="/field-trip"
            className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-medium text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            목록
          </Link>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="총 외근일(일자 분해)" value={`${stats.totalDays.toLocaleString()}일`} note="선택 구간(연/월) 기준" />
        <StatCard label="총 일정(원본 건수)" value={`${stats.totalTrips.toLocaleString()}건`} note="기간이 길어도 1건" />
        <StatCard label="참여 인원(작성자 기준)" value={`${stats.uniquePeople.toLocaleString()}명`} note="동명이인 구분 불가" />
        <StatCard
          label="가장 많이 간 지역"
          value={stats.topRegion || "-"}
          note={stats.topRegion ? `${stats.topRegionDays.toLocaleString()}일` : "데이터 없음"}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-[#E7E2D2] bg-white p-5">
        {monthFilter === null ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#211D14]">월별 외근 추이</h2>
              <span className="text-sm text-[#8A8270]">단위: 외근일(일자 분해)</span>
            </div>
            <div className="flex items-end gap-2 overflow-x-auto pb-2">
              {stats.monthDays.map((value, idx) => (
                <div key={idx} className="flex w-12 flex-shrink-0 flex-col items-center gap-1">
                  <span className="text-sm text-[#6B6455]">{value > 0 ? value : ""}</span>
                  <div
                    className={`w-full rounded-t ${idx + 1 === stats.busyMonth ? "bg-[#0F5C56]" : "bg-[#0F5C56]/30"}`}
                    style={{ height: `${Math.round((value / monthMax) * 140)}px` }}
                  />
                  <span className="text-sm text-[#8A8270]">{idx + 1}월</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-[#8A8270]">※ {stats.busyMonth}월이 월별 최다 외근일입니다.</p>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#211D14]">{monthFilter}월 일별 외근 추이</h2>
              <span className="text-sm text-[#8A8270]">단위: 외근일(일자 분해)</span>
            </div>
            <div className="flex items-end gap-1.5 overflow-x-auto pb-2">
              {dayEntries.map(({ day, value }) => (
                <div key={day} className="flex w-8 flex-shrink-0 flex-col items-center gap-1">
                  <span className="text-xs text-[#6B6455]">{value > 0 ? value : ""}</span>
                  <div
                    className="w-full rounded-t bg-[#0F5C56]/30"
                    style={{ height: `${Math.round((value / dayMax) * 140)}px` }}
                  />
                  <span className="text-xs text-[#8A8270]">
                    {day === 1 || day === dayEntries.length || day % 5 === 0 ? day : ""}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E7E2D2] bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-[#211D14]">부서(팀)별 외근일 비중</h2>
          {stats.deptList.length === 0 ? (
            <p className="text-base text-[#8A8270]">데이터가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {stats.deptList.map(({ dept, days, pct }) => (
                <div key={dept}>
                  <div className="mb-1 flex items-center justify-between text-base">
                    <span className="text-[#4B4739]">{dept}</span>
                    <span className="text-[#6B6455]">
                      {pct}% <span className="text-[#8A8270]">({days.toLocaleString()}일)</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#F0EDE0]">
                    <div className="h-full rounded-full bg-[#0F5C56]" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-sm text-[#8A8270]">정렬: 영업 → 공무 → 홍보 → 관리</p>
        </div>

        <div className="rounded-2xl border border-[#E7E2D2] bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-[#211D14]">개인별 외근일 · TOP3 지역</h2>
          {stats.personList.length === 0 ? (
            <p className="text-base text-[#8A8270]">데이터가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-base">
                <thead>
                  <tr className="border-b border-[#E7E2D2] text-left text-sm text-[#8A8270]">
                    <th className="py-2 font-medium">개인</th>
                    <th className="py-2 font-medium">외근일</th>
                    <th className="py-2 font-medium">일정건수</th>
                    <th className="py-2 font-medium">TOP3 지역</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.personList.map((p) => (
                    <tr key={p.name} className="border-b border-[#EDE7D3] text-[#4B4739]">
                      <td className="py-2">{p.name}</td>
                      <td className="py-2">{p.days.toLocaleString()}</td>
                      <td className="py-2">{p.trips.toLocaleString()}</td>
                      <td className="py-2 text-[#6B6455]">
                        {p.topRegions.length > 0
                          ? p.topRegions.map((r) => `${r.region}(${r.days}일)`).join(", ")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div className="rounded-2xl border border-[#E7E2D2] bg-white p-5">
    <div className="text-sm text-[#8A8270]">{label}</div>
    <div className="mt-2 text-3xl font-bold text-[#211D14]">{value}</div>
    <div className="mt-1 text-sm text-[#8A8270]">{note}</div>
  </div>
);
