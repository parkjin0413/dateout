import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { compareEmployees } from "@/lib/directory/dept";
import DirectoryList from "@/components/main/directory/directory-list";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function DirectoryPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let request = supabase.from("employees").select("*");
  if (query) {
    request = request.or(`name.ilike.%${query}%,department.ilike.%${query}%,job_title.ilike.%${query}%`);
  }
  const { data: employees } = await request;

  const rows = (employees ?? []).slice().sort(compareEmployees);
  const groups = Array.from(new Set(rows.map((e) => e.department))).map((department) => ({
    department,
    members: rows.filter((e) => e.department === department),
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">직원명부</h1>
          <p className="mt-1 text-base text-[#6B6455]">부서·직급·연락처로 동료를 빠르게 찾아보세요.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form method="get" className="flex items-center gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="이름, 부서, 직급 검색"
              className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none placeholder:text-[#8A8270]"
            />
            <button
              type="submit"
              className="rounded-lg border border-[#E7E2D2] px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
            >
              검색
            </button>
          </form>

          {isAdmin && (
            <Link
              href="/directory/new"
              className="rounded-lg bg-[#0F5C56] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
            >
              직원 추가
            </Link>
          )}
        </div>
      </div>

      <DirectoryList groups={groups} isAdmin={isAdmin} />
    </div>
  );
}
