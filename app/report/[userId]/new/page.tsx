import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { todayKst } from "@/lib/report/date";
import ReportForm from "@/components/main/report/report-form";
import { createWorkReport } from "../../actions";

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function NewWorkReportPage({ params }: Props) {
  const { userId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  if (user.id !== userId) redirect(`/report/${userId}`);

  const { data: board } = await supabase.from("report_boards").select("user_id").eq("user_id", userId).single();
  if (!board) notFound();

  const boundCreate = createWorkReport.bind(null, userId);

  return <ReportForm mode="create" action={boundCreate} userId={userId} workDate={todayKst()} />;
}
