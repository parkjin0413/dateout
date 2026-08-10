import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ReportForm from "@/components/main/report/report-form";
import { updateWorkReport } from "../../../actions";

type Props = {
  params: Promise<{ userId: string; reportId: string }>;
};

export default async function EditWorkReportPage({ params }: Props) {
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
  if (report.user_id !== user.id && !isAdmin) redirect(`/report/${userId}/${reportId}`);

  const boundUpdate = updateWorkReport.bind(null, reportId, userId);

  return <ReportForm mode="edit" action={boundUpdate} userId={userId} workDate={report.report_date} report={report} />;
}
