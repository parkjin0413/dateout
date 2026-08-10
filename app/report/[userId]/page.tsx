import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ReportList from "@/components/main/report/report-list";

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function UserReportPage({ params }: Props) {
  const { userId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: board } = await supabase.from("report_boards").select("user_id").eq("user_id", userId).single();
  if (!board) notFound();

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: person } = await supabase.from("users").select("name, email").eq("id", userId).single();
  const displayName = person?.name ?? person?.email ?? "업무보고";

  const { data: reports } = await supabase
    .from("work_reports")
    .select("*")
    .eq("user_id", userId)
    .order("report_date", { ascending: false })
    .order("created_at", { ascending: false });

  const isOwner = user.id === userId;

  return (
    <div className="relative min-h-screen w-full bg-[#181818]">
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-32 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/report" className="text-sm text-gray-500 transition-colors hover:text-gray-300">
              ← 업무 보고 목록
            </Link>
            <h1 className="mt-1 text-3xl font-bold text-white">{displayName}(업무보고)</h1>
          </div>

          {isOwner && (
            <Link
              href={`/report/${userId}/new`}
              className="rounded-lg bg-white px-4 py-2 text-base font-semibold text-black transition-colors hover:bg-gray-200"
            >
              업무보고 작성
            </Link>
          )}
        </div>

        <ReportList userId={userId} reports={reports ?? []} viewerId={user.id} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
