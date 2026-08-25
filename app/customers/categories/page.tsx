import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createCategory } from "@/app/customers/actions";
import DeleteCategoryButton from "@/components/main/customers/delete-category-button";

export default async function CustomerCategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: categories } = await supabase
    .from("customer_categories")
    .select("id, label, sort_order")
    .order("sort_order", { ascending: true });

  const { data: customerRows } = await supabase.from("customers").select("category");
  const usageCount = new Map<string, number>();
  for (const row of customerRows ?? []) {
    usageCount.set(row.category, (usageCount.get(row.category) ?? 0) + 1);
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/customers" className="text-sm text-[#8A8270] transition-colors hover:text-[#4B4739]">
          ← 고객 목록
        </Link>
        <h1 className="mt-1 text-3xl font-bold text-[#211D14]">구분 관리</h1>
        <p className="mt-1 text-base text-[#6B6455]">고객 등록 시 선택하는 구분(유입경로) 값을 관리합니다.</p>
      </div>

      <form
        action={createCategory}
        className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[#E7E2D2] bg-white p-4"
      >
        <input
          name="label"
          required
          placeholder="예) 지인소개, 웹사이트, 전시회"
          className="min-w-0 flex-1 rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#0F5C56] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
        >
          추가
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[#E7E2D2] bg-white">
        {(categories ?? []).length === 0 ? (
          <div className="px-4 py-12 text-center text-base text-[#8A8270]">등록된 구분이 없습니다.</div>
        ) : (
          <ul className="divide-y divide-[#EDE7D3]">
            {(categories ?? []).map((c) => {
              const count = usageCount.get(c.label) ?? 0;
              return (
                <li key={c.id} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-base text-[#211D14]">{c.label}</span>
                  {count > 0 ? (
                    <span className="text-sm text-[#8A8270]">사용 중 · {count}건</span>
                  ) : isAdmin ? (
                    <DeleteCategoryButton id={c.id} label={c.label} />
                  ) : (
                    <span className="text-sm text-[#8A8270]">미사용</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
