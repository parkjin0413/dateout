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
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-bold text-[#211D14]">{displayName}(업무보고)</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/report?view=all"
            className="flex items-center gap-2 rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="8" cy="8" r="3" />
              <circle cx="16" cy="8" r="3" />
              <path d="M2.5 19c.5-2.8 2.6-4.7 5.5-4.7s5 1.9 5.5 4.7" />
              <path d="M10.5 14.5c.4-2.4 2.3-4 4.5-4s4.1 1.6 4.5 4" />
            </svg>
            전체 직원 업무보고
          </Link>

          {isOwner && (
            <Link
              href={`/report/${userId}/new`}
              className="rounded-lg bg-[#0F5C56] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
            >
              업무보고 작성
            </Link>
          )}
        </div>
      </div>

      <ReportList userId={userId} reports={reports ?? []} viewerId={user.id} isAdmin={isAdmin} />
    </div>
  );
}
