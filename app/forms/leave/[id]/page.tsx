import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getStampSignedUrl } from "@/lib/expense/stamp-image";
import { EMPTY_LEAVE_BALANCE_ENTRY, type LeaveApprover, type LeaveBalance, type LeaveType } from "@/lib/leave/types";
import LeaveDocument from "@/components/main/forms/leave-document";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LeaveRequestViewPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();

  const { data: report } = await supabase.from("leave_requests").select("*").eq("id", id).single();
  if (!report) notFound();
  if (report.drafter_id !== user.id && !profile?.is_admin) notFound();

  const { data: drafter } = await supabase.from("users").select("job_title, stamp_path").eq("id", report.drafter_id).single();
  const stampUrl = await getStampSignedUrl(supabase, drafter?.stamp_path ?? null);

  const rawBalance = report.leave_balance as unknown as Partial<LeaveBalance> | null;
  const leaveBalance: LeaveBalance = {
    annual: rawBalance?.annual ?? EMPTY_LEAVE_BALANCE_ENTRY,
    substitute: rawBalance?.substitute ?? EMPTY_LEAVE_BALANCE_ENTRY,
  };

  return (
    <LeaveDocument
      report={{
        id: report.id,
        doc_number: report.doc_number,
        drafter_id: report.drafter_id,
        drafter_name: report.drafter_name,
        drafter_job_title: drafter?.job_title ?? "",
        department: report.department,
        drafted_at: report.drafted_at,
        start_date: report.start_date,
        end_date: report.end_date,
        days: report.days,
        leave_type: report.leave_type as LeaveType,
        reason: report.reason,
        substitute_job_title: report.substitute_job_title,
        substitute_name: report.substitute_name,
        leave_balance: leaveBalance,
        approvers: report.approvers as unknown as LeaveApprover[],
      }}
      stampUrl={stampUrl}
      canManage={report.drafter_id === user.id}
    />
  );
}
