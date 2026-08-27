import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getStampSignedUrl } from "@/lib/expense/stamp-image";
import type { ExpenseApprover, ExpenseItem, PaymentMethod } from "@/lib/expense/types";
import ExpenseDocument from "@/components/main/forms/expense-document";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExpenseReportViewPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();

  const { data: report } = await supabase.from("expense_reports").select("*").eq("id", id).single();
  if (!report) notFound();
  if (report.drafter_id !== user.id && !profile?.is_admin) notFound();

  const { data: drafter } = await supabase.from("users").select("job_title, stamp_path").eq("id", report.drafter_id).single();
  const stampUrl = await getStampSignedUrl(supabase, drafter?.stamp_path ?? null);

  return (
    <ExpenseDocument
      report={{
        id: report.id,
        doc_number: report.doc_number,
        drafter_id: report.drafter_id,
        drafter_name: report.drafter_name,
        drafter_job_title: drafter?.job_title ?? "",
        department: report.department,
        drafted_at: report.drafted_at,
        title: report.title,
        content: report.content,
        items: report.items as unknown as ExpenseItem[],
        total_amount: report.total_amount,
        payment_method: report.payment_method as PaymentMethod,
        vendor_basis: report.vendor_basis,
        attachment_types: report.attachment_types as unknown as string[],
        attachment_other: report.attachment_other,
        approvers: report.approvers as unknown as ExpenseApprover[],
      }}
      stampUrl={stampUrl}
      canManage={report.drafter_id === user.id}
    />
  );
}
