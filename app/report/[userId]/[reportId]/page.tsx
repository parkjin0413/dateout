import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import DeleteReportButton from "@/components/main/report/delete-report-button";

type Props = {
  params: Promise<{ userId: string; reportId: string }>;
};

export default async function WorkReportDetailPage({ params }: Props) {
  const { userId, reportId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: report } = await supabase
    .from("work_reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)
    .single();
  if (!report) notFound();

  const canManage = isAdmin || report.user_id === user.id;
  const listHref = `/report/${userId}`;

  return (
    <div>
      <div className="mb-8">
        <Link href={listHref} className="text-sm text-[#8A8270] transition-colors hover:text-[#4B4739]">
          ← 목록으로
        </Link>
        <h1 className="mt-1 text-3xl font-bold text-[#211D14]">{report.title}</h1>
        <p className="mt-1 text-base text-[#6B6455]">{report.report_date}</p>
      </div>

      <div className="max-w-2xl space-y-5 rounded-2xl border border-[#E7E2D2] bg-white p-6">
        <Section label="금일 업무" value={report.today_work} />
        <Section label="명일 업무" value={report.tomorrow_work} />
      </div>

      {canManage && (
        <div className="mt-6 flex items-center gap-4">
          <Link
            href={`/report/${userId}/${report.id}/edit`}
            className="text-base font-medium text-[#4B4739] transition-colors hover:text-[#211D14]"
          >
            수정
          </Link>
          <DeleteReportButton
            id={report.id}
            userId={userId}
            className="text-base font-medium text-red-600 transition-colors hover:text-red-700"
          />
        </div>
      )}
    </div>
  );
}

const Section = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="mb-1.5 text-base font-medium text-[#6B6455]">{label}</div>
    <div className="whitespace-pre-wrap text-base text-[#211D14]">{value || "-"}</div>
  </div>
);
