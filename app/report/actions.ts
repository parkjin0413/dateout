"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isValidDate } from "@/lib/report/date";
import { writeLog } from "@/lib/logs";

export type ReportFormState = { error: string } | null;

async function getViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin, name").eq("id", user.id).single();
  const actorName = profile?.name ?? user.email ?? "알 수 없음";

  return { supabase, userId: user.id, isAdmin: profile?.is_admin ?? false, actorName };
}

export async function createReportBoard(formData: FormData): Promise<void> {
  const { supabase, isAdmin, userId } = await getViewer();
  if (!isAdmin) redirect("/report");

  const targetUserId = String(formData.get("user_id") ?? "").trim();
  if (targetUserId) {
    const { data: existing } = await supabase.from("report_boards").select("user_id").eq("user_id", targetUserId).single();
    if (existing) redirect("/report?dup=1");

    await supabase.from("report_boards").insert({ user_id: targetUserId, created_by: userId });
    revalidatePath("/report");
  }

  redirect("/report");
}

export async function updateBoardDepartment(targetUserId: string, formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await getViewer();
  if (!isAdmin) redirect("/report");

  const department = String(formData.get("department") ?? "").trim();
  await supabase.from("report_boards").update({ department }).eq("user_id", targetUserId);
  revalidatePath("/report");
  redirect("/report");
}

export async function deleteReportBoard(targetUserId: string): Promise<void> {
  const { supabase, isAdmin } = await getViewer();
  if (!isAdmin) redirect("/report");

  // No FK/cascade is configured between these tables, so the person's
  // reports have to be removed explicitly or they'd become orphaned rows
  // still reachable by anyone who has the direct URL.
  await supabase.from("work_reports").delete().eq("user_id", targetUserId);
  await supabase.from("report_boards").delete().eq("user_id", targetUserId);
  revalidatePath("/report");
  redirect("/report");
}

export async function createWorkReport(
  targetUserId: string,
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const { supabase, userId, actorName } = await getViewer();
  if (targetUserId !== userId) return { error: "본인 게시판에서만 작성할 수 있습니다." };

  const { data: board } = await supabase.from("report_boards").select("id").eq("user_id", userId).single();
  if (!board) return { error: "아직 개인 업무보고 게시판이 없습니다. 관리자에게 문의해주세요." };

  const reportDate = String(formData.get("report_date") ?? "").trim();
  if (!isValidDate(reportDate)) return { error: "날짜 형식이 올바르지 않습니다." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "제목을 입력해주세요." };

  const todayWork = String(formData.get("today_work") ?? "").trim();
  const tomorrowWork = String(formData.get("tomorrow_work") ?? "").trim();

  const { error } = await supabase.from("work_reports").insert({
    user_id: userId,
    report_date: reportDate,
    title,
    today_work: todayWork,
    tomorrow_work: tomorrowWork,
  });

  if (error) return { error: "등록 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "CREATE_REPORT",
    message: `${actorName}님이 업무보고를 작성했습니다: ${title}`,
    actorId: userId,
    actorName,
  });

  revalidatePath(`/report/${userId}`);
  redirect(`/report/${userId}`);
}

export async function updateWorkReport(
  id: string,
  targetUserId: string,
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const { supabase, userId, isAdmin, actorName } = await getViewer();

  const { data: existing } = await supabase.from("work_reports").select("user_id").eq("id", id).single();
  if (!existing) return { error: "업무보고를 찾을 수 없습니다." };
  if (existing.user_id !== userId && !isAdmin) return { error: "수정 권한이 없습니다." };

  const reportDate = String(formData.get("report_date") ?? "").trim();
  if (!isValidDate(reportDate)) return { error: "날짜 형식이 올바르지 않습니다." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "제목을 입력해주세요." };

  const todayWork = String(formData.get("today_work") ?? "").trim();
  const tomorrowWork = String(formData.get("tomorrow_work") ?? "").trim();

  const { error } = await supabase
    .from("work_reports")
    .update({
      report_date: reportDate,
      title,
      today_work: todayWork,
      tomorrow_work: tomorrowWork,
    })
    .eq("id", id);

  if (error) return { error: "수정 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "UPDATE_REPORT",
    message: `${actorName}님이 업무보고를 수정했습니다: ${title}`,
    actorId: userId,
    actorName,
  });

  revalidatePath(`/report/${targetUserId}`);
  redirect(`/report/${targetUserId}`);
}

export async function deleteWorkReport(id: string, targetUserId: string): Promise<void> {
  const { supabase, userId, isAdmin, actorName } = await getViewer();

  const { data: existing } = await supabase.from("work_reports").select("user_id, title").eq("id", id).single();

  if (existing && (existing.user_id === userId || isAdmin)) {
    await supabase.from("work_reports").delete().eq("id", id);
    await writeLog({
      level: "info",
      action: "DELETE_REPORT",
      message: `${actorName}님이 업무보고를 삭제했습니다: ${existing.title}`,
      actorId: userId,
      actorName,
    });
    revalidatePath(`/report/${targetUserId}`);
  }

  redirect(`/report/${targetUserId}`);
}
