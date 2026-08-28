"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isValidDate } from "@/lib/date-kst";
import { generateDocNumber } from "@/lib/leave/doc-number";
import { LEAVE_TYPES, type LeaveApprover } from "@/lib/leave/types";
import { writeLog } from "@/lib/logs";

async function getViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("users")
    .select("name, department, is_admin, phone")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    userId: user.id,
    actorName: profile?.name ?? user.email ?? "알 수 없음",
    department: profile?.department ?? "",
    isAdmin: profile?.is_admin ?? false,
    phone: profile?.phone ?? null,
  };
}

async function readApprovers(
  supabase: Awaited<ReturnType<typeof getViewer>>["supabase"],
  formData: FormData,
  drafterId: string
): Promise<LeaveApprover[] | { error: string }> {
  const ids = [1, 2, 3]
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

export type LeaveFormState = { error: string } | null;

type ParsedFields = {
  draftedAt: string;
  startDate: string;
  endDate: string;
  days: number;
  leaveType: string;
  reason: string;
};

function parseFields(formData: FormData): ParsedFields | { error: string } {
  const draftedAt = String(formData.get("drafted_at") ?? "").trim();
  if (!isValidDate(draftedAt)) return { error: "기안일을 입력해주세요." };

  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  if (!isValidDate(startDate) || !isValidDate(endDate)) return { error: "휴가기간을 입력해주세요." };
  if (endDate < startDate) return { error: "휴가 종료일은 시작일보다 빠를 수 없습니다." };

  const days = Number(formData.get("days") ?? "");
  if (!Number.isFinite(days) || days <= 0) return { error: "신청일수를 선택해주세요." };
  if (startDate === endDate && days > 1) return { error: "휴가기간이 하루인데 신청일수가 1일을 초과할 수 없습니다." };
  if (startDate !== endDate && days <= 0.5) return { error: "휴가기간이 여러 날인데 신청일수가 0.5일일 수 없습니다." };

  const leaveType = String(formData.get("leave_type") ?? "");
  if (!LEAVE_TYPES.includes(leaveType as (typeof LEAVE_TYPES)[number])) return { error: "휴가종류를 선택해주세요." };

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "휴가 사유를 입력해주세요." };

  return { draftedAt, startDate, endDate, days, leaveType, reason };
}

export async function createLeaveRequest(_prevState: LeaveFormState, formData: FormData): Promise<LeaveFormState> {
  const { supabase, userId, actorName, department, phone } = await getViewer();

  const parsed = parseFields(formData);
  if ("error" in parsed) return parsed;

  const approvers = await readApprovers(supabase, formData, userId);
  if ("error" in approvers) return approvers;
  if (approvers.length < 1) return { error: "결재자를 1명 이상 지정해주세요." };

  const docNumber = await generateDocNumber(supabase, userId, phone);

  const { data: inserted, error } = await supabase
    .from("leave_requests")
    .insert({
      doc_number: docNumber,
      drafter_id: userId,
      drafter_name: actorName,
      department,
      drafted_at: parsed.draftedAt,
      start_date: parsed.startDate,
      end_date: parsed.endDate,
      days: parsed.days,
      leave_type: parsed.leaveType,
      reason: parsed.reason,
      approvers,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: "저장 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "CREATE_LEAVE_REQUEST",
    message: `${actorName}님이 연차신청서를 작성했습니다: ${parsed.startDate} ~ ${parsed.endDate}`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/forms/leave");
  redirect(`/forms/leave/${inserted.id}`);
}

export async function updateLeaveRequest(
  id: string,
  _prevState: LeaveFormState,
  formData: FormData
): Promise<LeaveFormState> {
  const { supabase, userId, actorName } = await getViewer();

  const { data: existing } = await supabase.from("leave_requests").select("drafter_id").eq("id", id).single();
  if (!existing || existing.drafter_id !== userId) return { error: "수정 권한이 없습니다." };

  const parsed = parseFields(formData);
  if ("error" in parsed) return parsed;

  const approvers = await readApprovers(supabase, formData, userId);
  if ("error" in approvers) return approvers;
  if (approvers.length < 1) return { error: "결재자를 1명 이상 지정해주세요." };

  const { error } = await supabase
    .from("leave_requests")
    .update({
      drafted_at: parsed.draftedAt,
      start_date: parsed.startDate,
      end_date: parsed.endDate,
      days: parsed.days,
      leave_type: parsed.leaveType,
      reason: parsed.reason,
      approvers,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: "수정 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "UPDATE_LEAVE_REQUEST",
    message: `${actorName}님이 연차신청서를 수정했습니다: ${parsed.startDate} ~ ${parsed.endDate}`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/forms/leave");
  revalidatePath(`/forms/leave/${id}`);
  redirect(`/forms/leave/${id}`);
}

export async function deleteLeaveRequest(id: string): Promise<void> {
  const { supabase, userId, actorName } = await getViewer();

  const { data: existing } = await supabase.from("leave_requests").select("drafter_id, start_date, end_date").eq("id", id).single();

  if (existing && existing.drafter_id === userId) {
    await supabase.from("leave_requests").delete().eq("id", id);

    await writeLog({
      level: "info",
      action: "DELETE_LEAVE_REQUEST",
      message: `${actorName}님이 연차신청서를 삭제했습니다: ${existing.start_date} ~ ${existing.end_date}`,
      actorId: userId,
      actorName,
    });

    revalidatePath("/forms/leave");
  }

  redirect("/forms/leave");
}
