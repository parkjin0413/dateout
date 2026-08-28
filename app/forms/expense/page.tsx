import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ExpenseReportListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  let query = supabase
    .from("expense_reports")
    .select("id, doc_number, title, drafted_at, total_amount, payment_method, drafter_name")
    .order("created_at", { ascending: false });
  if (!isAdmin) query = query.eq("drafter_id", user.id);
  const { data: reports } = await query;

  const rows = reports ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">지출결의서</h1>
          <p className="mt-1 text-base text-[#6B6455]">{isAdmin ? "전체 직원이 작성한 지출결의서 목록입니다." : "내가 작성한 지출결의서 목록입니다."}</p>
        </div>
        <Link
          href="/forms/expense/new"
          className="flex items-center rounded-xl bg-[#0F5C56] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
        >
          + 새 지출결의서
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-[#E7E2D2] bg-white p-10 text-center text-base text-[#6B6455]">
          작성한 지출결의서가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E7E2D2] bg-white">
          <table className="w-full min-w-[720px] text-left text-base">
            <thead>
              <tr className="border-b border-[#E7E2D2] text-sm text-[#8A8270]">
                <th className="px-5 py-3 font-medium">문서번호</th>
                {isAdmin && <th className="px-5 py-3 font-medium">기안자</th>}
                <th className="px-5 py-3 font-medium">건명</th>
                <th className="px-5 py-3 font-medium">기안일</th>
                <th className="px-5 py-3 font-medium">금액</th>
                <th className="px-5 py-3 font-medium">결제방법</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#F0EDE1] last:border-0 hover:bg-[#FAF8F0]">
                  <td className="px-5 py-3">
                    <Link href={`/forms/expense/${r.id}`} className="font-medium text-[#0F5C56] hover:underline">
                      {r.doc_number}
                    </Link>
                  </td>
                  {isAdmin && <td className="px-5 py-3 text-[#4B4739]">{r.drafter_name}</td>}
                  <td className="px-5 py-3 text-[#211D14]">{r.title}</td>
                  <td className="px-5 py-3 text-[#4B4739]">{r.drafted_at}</td>
                  <td className="px-5 py-3 text-[#211D14]">{r.total_amount.toLocaleString("ko-KR")}원</td>
                  <td className="px-5 py-3 text-[#4B4739]">{r.payment_method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
