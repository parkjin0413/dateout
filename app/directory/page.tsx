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
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">인명록</h1>
            <p className="mt-1 text-base text-gray-400">부서·직급·연락처로 동료를 빠르게 찾아보세요.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form method="get" className="flex items-center gap-2">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="이름, 부서, 직급 검색"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white outline-none placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="rounded-lg border border-white/30 px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-white hover:text-black"
              >
                검색
              </button>
            </form>

            {isAdmin && (
              <Link
                href="/directory/new"
                className="rounded-lg bg-white px-4 py-2 text-base font-semibold text-black transition-colors hover:bg-gray-200"
              >
                직원 추가
              </Link>
            )}
          </div>
        </div>

        <DirectoryList groups={groups} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
