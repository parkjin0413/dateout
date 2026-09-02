import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getStampSignedUrl } from "@/lib/expense/stamp-image";
import { EMPTY_LEAVE_BALANCE_ENTRY, type LeaveApprover, type LeaveBalance } from "@/lib/leave/types";
import LeaveForm from "@/components/main/forms/leave-form";
import { updateLeaveRequest } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditLeaveRequestPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: report } = await supabase.from("leave_requests").select("*").eq("id", id).single();
  if (!report) notFound();
  if (report.drafter_id !== user.id) redirect(`/forms/leave/${id}`);

  const { data: profile } = await supabase
    .from("users")
    .select("name, department, job_title, stamp_path")
    .eq("id", user.id)
    .single();

  const { data: employees } = await supabase
    .from("users")
    .select("id, name, department, job_title")
    .order("department", { ascending: true });

  const candidates = (employees ?? []).filter((e) => e.id !== user.id);
  const stampUrl = await getStampSignedUrl(supabase, profile?.stamp_path ?? null);

  const approvers = report.approvers as unknown as LeaveApprover[];
  const approverByOrder = (order: number) => approvers.find((a) => a.order === order)?.userId ?? "";

  const rawBalance = report.leave_balance as unknown as Partial<LeaveBalance> | null;
  const balanceAnnual = rawBalance?.annual ?? EMPTY_LEAVE_BALANCE_ENTRY;
  const balanceSubstitute = rawBalance?.substitute ?? EMPTY_LEAVE_BALANCE_ENTRY;

  return (
    <LeaveForm
      mode="edit"
      action={updateLeaveRequest.bind(null, id)}
      drafterName={profile?.name ?? user.email ?? ""}
      drafterJobTitle={profile?.job_title ?? ""}
      department={profile?.department ?? ""}
      draftedAt={report.drafted_at}
      employees={candidates}
      stampUrl={stampUrl}
      cancelHref={`/forms/leave/${id}`}
      initial={{
        startDate: report.start_date,
        endDate: report.end_date,
        days: String(report.days),
        leaveType: report.leave_type,
        reason: report.reason,
        substituteJobTitle: report.substitute_job_title,
        substituteName: report.substitute_name,
        balanceAnnual,
        balanceSubstitute,
        approver1: approverByOrder(1),
        approver2: approverByOrder(2),
        approver3: approverByOrder(3),
      }}
    />
  );
}
