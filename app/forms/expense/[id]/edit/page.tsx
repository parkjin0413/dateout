import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getStampSignedUrl } from "@/lib/expense/stamp-image";
import type { ExpenseApprover, ExpenseItem } from "@/lib/expense/types";
import ExpenseForm from "@/components/main/forms/expense-form";
import { updateExpenseReport } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditExpenseReportPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: report } = await supabase.from("expense_reports").select("*").eq("id", id).single();
  if (!report) notFound();
  if (report.drafter_id !== user.id) redirect(`/forms/expense/${id}`);

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

  const items = report.items as unknown as ExpenseItem[];
  const approvers = report.approvers as unknown as ExpenseApprover[];
  const approverByOrder = (order: number) => approvers.find((a) => a.order === order)?.userId ?? "";

  return (
    <ExpenseForm
      mode="edit"
      action={updateExpenseReport.bind(null, id)}
      drafterName={profile?.name ?? user.email ?? ""}
      drafterJobTitle={profile?.job_title ?? ""}
      department={profile?.department ?? ""}
      draftedAt={report.drafted_at}
      employees={candidates}
      stampUrl={stampUrl}
      cancelHref={`/forms/expense/${id}`}
      initial={{
        title: report.title,
        content: report.content,
        items: items.map((it) => ({ date: it.date, description: it.description, vendor: it.vendor, amount: String(it.amount) })),
        paymentMethod: report.payment_method,
        vendorBasis: report.vendor_basis,
        approver1: approverByOrder(1),
        approver2: approverByOrder(2),
        approver3: approverByOrder(3),
        attachmentTypes: (report.attachment_types as unknown as string[]) ?? [],
        attachmentOther: report.attachment_other,
      }}
    />
  );
}
