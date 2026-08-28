import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { computeCustomerStats } from "@/lib/customers/stats";
import { todayKst } from "@/lib/customers/date";

type Props = {
  searchParams: Promise<{ year?: string }>;
};

export default async function CustomerStatsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const params = await searchParams;
  const currentYear = Number(todayKst().slice(0, 4));
  const year = Number(params.year) || currentYear;

  const { data: rows } = await supabase.from("customers").select("category, owner_id, created_at");
  const customers = rows ?? [];

  const ownerIds = Array.from(new Set(customers.map((c) => c.owner_id).filter((id): id is string => !!id)));
  const { data: owners } =
    ownerIds.length > 0 ? await supabase.from("users").select("id, name, email").in("id", ownerIds) : { data: [] };
  const ownerNameMap = new Map((owners ?? []).map((o) => [o.id, o.name ?? o.email]));

  const stats = computeCustomerStats(customers, ownerNameMap, year);
  const monthMax = Math.max(1, ...stats.monthCounts);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">고객 통계</h1>
          <p className="mt-1 text-base text-[#6B6455]">전체 고객 기준 요약입니다.</p>
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
          <button
            type="submit"
            className="rounded-lg border border-[#E7E2D2] px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            조회
          </button>
          <Link
            href="/customers"
            className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-medium text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            목록
          </Link>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="전체 고객 수" value={`${stats.totalCustomers.toLocaleString()}명`} note="구분 무관 전체" />
        <StatCard
          label="가장 많은 구분"
          value={stats.categoryList[0]?.category ?? "-"}
          note={stats.categoryList[0] ? `${stats.categoryList[0].count.toLocaleString()}명 (${stats.categoryList[0].pct}%)` : "데이터 없음"}
        />
        <StatCard
          label={`${year}년 신규 등록 최다월`}
          value={stats.monthCounts.some((v) => v > 0) ? `${stats.busyMonth}월` : "-"}
          note={stats.monthCounts.some((v) => v > 0) ? `${Math.max(...stats.monthCounts).toLocaleString()}건` : "데이터 없음"}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-[#E7E2D2] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#211D14]">{year}년 월별 신규 등록 추이</h2>
          <span className="text-sm text-[#8A8270]">단위: 건</span>
        </div>
        <div className="flex items-end gap-2 overflow-x-auto pb-2">
          {stats.monthCounts.map((value, idx) => (
            <div key={idx} className="flex w-12 flex-shrink-0 flex-col items-center gap-1">
              <span className="text-sm text-[#6B6455]">{value > 0 ? value : ""}</span>
              <div
                className={`w-full rounded-t ${idx + 1 === stats.busyMonth && value > 0 ? "bg-[#0F5C56]" : "bg-[#0F5C56]/30"}`}
                style={{ height: `${Math.round((value / monthMax) * 140)}px` }}
              />
              <span className="text-sm text-[#8A8270]">{idx + 1}월</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E7E2D2] bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-[#211D14]">구분별 고객 비중</h2>
          {stats.categoryList.length === 0 ? (
            <p className="text-base text-[#8A8270]">데이터가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {stats.categoryList.map(({ category, count, pct }) => (
                <div key={category}>
                  <div className="mb-1 flex items-center justify-between text-base">
                    <span className="text-[#4B4739]">{category}</span>
                    <span className="text-[#6B6455]">
                      {pct}% <span className="text-[#8A8270]">({count.toLocaleString()}명)</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#F0EDE0]">
                    <div className="h-full rounded-full bg-[#0F5C56]" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#E7E2D2] bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-[#211D14]">담당자별 고객 수</h2>
          {stats.ownerList.length === 0 ? (
            <p className="text-base text-[#8A8270]">데이터가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-base">
                <thead>
                  <tr className="border-b border-[#E7E2D2] text-left text-sm text-[#8A8270]">
                    <th className="py-2 font-medium">담당자</th>
                    <th className="py-2 font-medium">고객 수</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.ownerList.map((o) => (
                    <tr key={o.ownerName} className="border-b border-[#EDE7D3] text-[#4B4739]">
                      <td className="py-2">{o.ownerName}</td>
                      <td className="py-2">{o.count.toLocaleString()}</td>
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
