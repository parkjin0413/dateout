"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isValidDate } from "@/lib/date-kst";
import { generateDocNumber } from "@/lib/meeting/doc-number";
import type { MeetingApprover, MeetingItem } from "@/lib/meeting/types";
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

function readItems(formData: FormData): MeetingItem[] {
  const categories = formData.getAll("item_category").map(String);
  const contents = formData.getAll("item_content").map(String);
  const notes = formData.getAll("item_note").map(String);

  const items: MeetingItem[] = [];
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]?.trim() ?? "";
    if (!content) continue;
    items.push({ category: categories[i]?.trim() ?? "", content, note: notes[i]?.trim() ?? "" });
  }
  return items;
}

async function readApprovers(
  supabase: Awaited<ReturnType<typeof getViewer>>["supabase"],
  formData: FormData,
  drafterId: string
): Promise<MeetingApprover[] | { error: string }> {
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

export type MeetingFormState = { error: string } | null;

type ParsedFields = {
  draftedAt: string;
  siteName: string;
  meetingDate: string;
  location: string;
  counterpartName: string;
  counterpartOrg: string;
  items: MeetingItem[];
  photoTaken: boolean;
  drawingAttached: boolean;
};

function parseFields(formData: FormData): ParsedFields | { error: string } {
  const draftedAt = String(formData.get("drafted_at") ?? "").trim();
  if (!isValidDate(draftedAt)) return { error: "기안일을 입력해주세요." };

  const siteName = String(formData.get("site_name") ?? "").trim();
  if (!siteName) return { error: "현장명을 입력해주세요." };

  const meetingDate = String(formData.get("meeting_date") ?? "").trim();
  if (!isValidDate(meetingDate)) return { error: "협의일자를 입력해주세요." };

  const location = String(formData.get("location") ?? "").trim();
  const counterpartName = String(formData.get("counterpart_name") ?? "").trim();
  if (!counterpartName) return { error: "협의 상대방 성명을 입력해주세요." };

  const counterpartOrg = String(formData.get("counterpart_org") ?? "").trim();

  const items = readItems(formData);
  if (items.length === 0) return { error: "협의 내용을 1건 이상 입력해주세요." };

  const photoTaken = formData.get("photo_taken") === "on";
  const drawingAttached = formData.get("drawing_attached") === "on";

  return { draftedAt, siteName, meetingDate, location, counterpartName, counterpartOrg, items, photoTaken, drawingAttached };
}

export async function createMeetingRecord(_prevState: MeetingFormState, formData: FormData): Promise<MeetingFormState> {
  const { supabase, userId, actorName, department, phone } = await getViewer();

  const parsed = parseFields(formData);
  if ("error" in parsed) return parsed;

  const approvers = await readApprovers(supabase, formData, userId);
  if ("error" in approvers) return approvers;
  if (approvers.length < 1) return { error: "결재자를 1명 이상 지정해주세요." };

  const docNumber = await generateDocNumber(supabase, userId, phone);

  const { data: inserted, error } = await supabase
    .from("meeting_records")
    .insert({
      doc_number: docNumber,
      drafter_id: userId,
      drafter_name: actorName,
      department,
      drafted_at: parsed.draftedAt,
      site_name: parsed.siteName,
      meeting_date: parsed.meetingDate,
      location: parsed.location,
      counterpart_name: parsed.counterpartName,
      counterpart_org: parsed.counterpartOrg,
      items: parsed.items,
      photo_taken: parsed.photoTaken,
      drawing_attached: parsed.drawingAttached,
      approvers,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: "저장 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "CREATE_MEETING_RECORD",
    message: `${actorName}님이 현장 협의록을 작성했습니다: ${parsed.siteName}`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/forms/meeting");
  redirect(`/forms/meeting/${inserted.id}`);
}

export async function updateMeetingRecord(
  id: string,
  _prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const { supabase, userId, actorName } = await getViewer();

  const { data: existing } = await supabase.from("meeting_records").select("drafter_id").eq("id", id).single();
  if (!existing || existing.drafter_id !== userId) return { error: "수정 권한이 없습니다." };

  const parsed = parseFields(formData);
  if ("error" in parsed) return parsed;

  const approvers = await readApprovers(supabase, formData, userId);
  if ("error" in approvers) return approvers;
  if (approvers.length < 1) return { error: "결재자를 1명 이상 지정해주세요." };

  const { error } = await supabase
    .from("meeting_records")
    .update({
      drafted_at: parsed.draftedAt,
      site_name: parsed.siteName,
      meeting_date: parsed.meetingDate,
      location: parsed.location,
      counterpart_name: parsed.counterpartName,
      counterpart_org: parsed.counterpartOrg,
      items: parsed.items,
      photo_taken: parsed.photoTaken,
      drawing_attached: parsed.drawingAttached,
      approvers,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: "수정 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "UPDATE_MEETING_RECORD",
    message: `${actorName}님이 현장 협의록을 수정했습니다: ${parsed.siteName}`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/forms/meeting");
  revalidatePath(`/forms/meeting/${id}`);
  redirect(`/forms/meeting/${id}`);
}

export async function deleteMeetingRecord(id: string): Promise<void> {
  const { supabase, userId, actorName } = await getViewer();

  const { data: existing } = await supabase.from("meeting_records").select("drafter_id, site_name").eq("id", id).single();

  if (existing && existing.drafter_id === userId) {
    await supabase.from("meeting_records").delete().eq("id", id);

    await writeLog({
      level: "info",
      action: "DELETE_MEETING_RECORD",
      message: `${actorName}님이 현장 협의록을 삭제했습니다: ${existing.site_name}`,
      actorId: userId,
      actorName,
    });

    revalidatePath("/forms/meeting");
  }

  redirect("/forms/meeting");
}
