"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isValidDate } from "@/lib/date-kst";
import { generateDocNumber } from "@/lib/expense/doc-number";
import {
  ATTACHMENT_TYPES,
  type AttachmentType,
  type ExpenseApprover,
  type ExpenseConsultation,
  type ExpenseItem,
} from "@/lib/expense/types";
import { writeLog } from "@/lib/logs";

async function getViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("users")
    .select("name, department, is_admin")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    userId: user.id,
    actorName: profile?.name ?? user.email ?? "알 수 없음",
    department: profile?.department ?? "",
    isAdmin: profile?.is_admin ?? false,
  };
}

function readItems(formData: FormData): ExpenseItem[] {
  const descriptions = formData.getAll("item_description").map(String);
  const vendors = formData.getAll("item_vendor").map(String);
  const amounts = formData.getAll("item_amount").map(String);

  const items: ExpenseItem[] = [];
  for (let i = 0; i < descriptions.length; i++) {
    const description = descriptions[i]?.trim() ?? "";
    const amount = Number(amounts[i]?.replace(/,/g, ""));
    if (!description || !Number.isFinite(amount) || amount <= 0) continue;
    items.push({ description, vendor: vendors[i]?.trim() ?? "", amount });
  }
  return items;
}

function readAttachmentTypes(formData: FormData): AttachmentType[] {
  const values = formData.getAll("attachment_types").map(String);
  return ATTACHMENT_TYPES.filter((t) => values.includes(t));
}

function readConsultations(formData: FormData): ExpenseConsultation[] {
  const departments = formData.getAll("consultation_department").map(String);
  return departments
    .map((d) => d.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((department) => ({ department }));
}

async function readApprovers(
  supabase: Awaited<ReturnType<typeof getViewer>>["supabase"],
  formData: FormData,
  drafterId: string
): Promise<ExpenseApprover[] | { error: string }> {
  const ids = [1, 2, 3, 4]
    .map((n) => String(formData.get(`approver_${n}`) ?? "").trim())
    .filter((id) => id.length > 0);
  if (ids.length === 0) return [];

  if (new Set(ids).size !== ids.length) return { error: "결재자를 중복 없이 지정해주세요." };
  if (ids.includes(drafterId)) return { error: "본인을 결재자로 지정할 수 없습니다." };

  const { data: rows } = await supabase.from("users").select("id, name, job_title").in("id", ids);
  const byId = new Map((rows ?? []).map((r) => [r.id, r]));

  return ids.map((id, index) => ({
    order: index + 1,
    userId: id,
    name: byId.get(id)?.name ?? "",
    jobTitle: byId.get(id)?.job_title ?? "",
  }));
}

export type ExpenseFormState = { error: string } | null;

type ParsedFields = {
  title: string;
  draftedAt: string;
  content: string;
  items: ExpenseItem[];
  totalAmount: number;
  consultations: ExpenseConsultation[];
  instructions: string;
  attachmentTypes: AttachmentType[];
  attachmentOther: string;
};

function parseFields(formData: FormData): ParsedFields | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "제목을 입력해주세요." };

  const draftedAt = String(formData.get("drafted_at") ?? "").trim();
  if (!isValidDate(draftedAt)) return { error: "기안일을 입력해주세요." };

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "내용을 입력해주세요." };

  const items = readItems(formData);
  if (items.length === 0) return { error: "지출 항목을 1건 이상 입력해주세요." };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const consultations = readConsultations(formData);
  const instructions = String(formData.get("instructions") ?? "").trim();
  const attachmentTypes = readAttachmentTypes(formData);
  const attachmentOther = String(formData.get("attachment_other") ?? "").trim();

  return { title, draftedAt, content, items, totalAmount, consultations, instructions, attachmentTypes, attachmentOther };
}

export async function createExpenseReport(_prevState: ExpenseFormState, formData: FormData): Promise<ExpenseFormState> {
  const { supabase, userId, actorName, department } = await getViewer();

  const parsed = parseFields(formData);
  if ("error" in parsed) return parsed;

  const approvers = await readApprovers(supabase, formData, userId);
  if ("error" in approvers) return approvers;
  if (approvers.length < 1) return { error: "결재자를 1명 이상 지정해주세요." };

  const docNumber = await generateDocNumber(supabase, department, parsed.draftedAt);

  const { data: inserted, error } = await supabase
    .from("expense_reports")
    .insert({
      doc_number: docNumber,
      drafter_id: userId,
      drafter_name: actorName,
      department,
      drafted_at: parsed.draftedAt,
      title: parsed.title,
      content: parsed.content,
      items: parsed.items,
      total_amount: parsed.totalAmount,
      consultations: parsed.consultations,
      instructions: parsed.instructions,
      attachment_types: parsed.attachmentTypes,
      attachment_other: parsed.attachmentOther,
      approvers,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: "저장 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "CREATE_EXPENSE_REPORT",
    message: `${actorName}님이 품의서를 작성했습니다: ${parsed.title}`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/forms/expense");
  redirect(`/forms/expense/${inserted.id}`);
}

export async function updateExpenseReport(
  id: string,
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const { supabase, userId, actorName } = await getViewer();

  const { data: existing } = await supabase.from("expense_reports").select("drafter_id").eq("id", id).single();
  if (!existing || existing.drafter_id !== userId) return { error: "수정 권한이 없습니다." };

  const parsed = parseFields(formData);
  if ("error" in parsed) return parsed;

  const approvers = await readApprovers(supabase, formData, userId);
  if ("error" in approvers) return approvers;
  if (approvers.length < 1) return { error: "결재자를 1명 이상 지정해주세요." };

  const { error } = await supabase
    .from("expense_reports")
    .update({
      drafted_at: parsed.draftedAt,
      title: parsed.title,
      content: parsed.content,
      items: parsed.items,
      total_amount: parsed.totalAmount,
      consultations: parsed.consultations,
      instructions: parsed.instructions,
      attachment_types: parsed.attachmentTypes,
      attachment_other: parsed.attachmentOther,
      approvers,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: "수정 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "UPDATE_EXPENSE_REPORT",
    message: `${actorName}님이 품의서를 수정했습니다: ${parsed.title}`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/forms/expense");
  revalidatePath(`/forms/expense/${id}`);
  redirect(`/forms/expense/${id}`);
}

export async function deleteExpenseReport(id: string): Promise<void> {
  const { supabase, userId, actorName } = await getViewer();

  const { data: existing } = await supabase.from("expense_reports").select("drafter_id, title").eq("id", id).single();

  if (existing && existing.drafter_id === userId) {
    await supabase.from("expense_reports").delete().eq("id", id);

    await writeLog({
      level: "info",
      action: "DELETE_EXPENSE_REPORT",
      message: `${actorName}님이 품의서를 삭제했습니다: ${existing.title}`,
      actorId: userId,
      actorName,
    });

    revalidatePath("/forms/expense");
  }

  redirect("/forms/expense");
}
