import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function LeaveRequestListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  let query = supabase
    .from("leave_requests")
    .select("id, doc_number, start_date, end_date, days, leave_type, drafter_name")
    .order("created_at", { ascending: false });
  if (!isAdmin) query = query.eq("drafter_id", user.id);
  const { data: requests } = await query;

  const rows = requests ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">연차신청서</h1>
          <p className="mt-1 text-base text-[#6B6455]">{isAdmin ? "전체 직원이 작성한 연차신청서 목록입니다." : "내가 작성한 연차신청서 목록입니다."}</p>
        </div>
        <Link
          href="/forms/leave/new"
          className="flex items-center rounded-xl bg-[#0F5C56] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
        >
          + 새 연차신청서
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-[#E7E2D2] bg-white p-10 text-center text-base text-[#6B6455]">
          작성한 연차신청서가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E7E2D2] bg-white">
          <table className="w-full min-w-[640px] text-left text-base">
            <thead>
              <tr className="border-b border-[#E7E2D2] text-sm text-[#8A8270]">
                <th className="px-5 py-3 font-medium">문서번호</th>
                {isAdmin && <th className="px-5 py-3 font-medium">기안자</th>}
                <th className="px-5 py-3 font-medium">휴가종류</th>
                <th className="px-5 py-3 font-medium">휴가기간</th>
                <th className="px-5 py-3 font-medium">일수</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#F0EDE1] last:border-0 hover:bg-[#FAF8F0]">
                  <td className="px-5 py-3">
                    <Link href={`/forms/leave/${r.id}`} className="font-medium text-[#0F5C56] hover:underline">
                      {r.doc_number}
                    </Link>
                  </td>
                  {isAdmin && <td className="px-5 py-3 text-[#4B4739]">{r.drafter_name}</td>}
                  <td className="px-5 py-3 text-[#211D14]">{r.leave_type}</td>
                  <td className="px-5 py-3 text-[#4B4739]">
                    {r.start_date} ~ {r.end_date}
                  </td>
                  <td className="px-5 py-3 text-[#211D14]">{r.days}일</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
