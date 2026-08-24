"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isValidDate } from "@/lib/schedule/date";
import { writeLog } from "@/lib/logs";

export type ScheduleFormState = { error: string } | null;

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

function readTripRange(formData: FormData, baseDate: string) {
  const tripEnabled = formData.get("trip_enabled") === "on";
  let tripStart = String(formData.get("trip_start") ?? "").trim() || baseDate;
  let tripEnd = String(formData.get("trip_end") ?? "").trim() || baseDate;

  if (!tripEnabled) {
    tripStart = baseDate;
    tripEnd = baseDate;
  }

  return { tripStart, tripEnd };
}

export async function createSchedule(
  _prevState: ScheduleFormState,
  formData: FormData
): Promise<ScheduleFormState> {
  const { supabase, userId, actorName } = await getViewer();

  const baseDate = String(formData.get("base_date") ?? "").trim();
  if (!isValidDate(baseDate)) return { error: "날짜 형식이 올바르지 않습니다." };

  const { tripStart, tripEnd } = readTripRange(formData, baseDate);
  if (!isValidDate(tripStart) || !isValidDate(tripEnd)) {
    return { error: "기간 날짜 형식이 올바르지 않습니다." };
  }
  if (tripStart > tripEnd) return { error: "시작일은 종료일보다 늦을 수 없습니다." };

  const department = String(formData.get("department") ?? "").trim();
  if (!department) return { error: "부서를 선택해주세요." };

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "내용을 입력해주세요." };

  const { error } = await supabase.from("schedules").insert({
    user_id: userId,
    department,
    content,
    base_date: baseDate,
    trip_start: tripStart,
    trip_end: tripEnd,
  });

  if (error) return { error: "등록 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "CREATE_SCHEDULE",
    message: `${actorName}님이 일정을 등록했습니다: ${content}`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/schedule");
  redirect(`/schedule?ym=${baseDate.slice(0, 7)}&date=${baseDate}`);
}

export async function updateSchedule(
  id: string,
  _prevState: ScheduleFormState,
  formData: FormData
): Promise<ScheduleFormState> {
  const { supabase, userId, isAdmin, actorName } = await getViewer();

  const { data: existing } = await supabase.from("schedules").select("user_id").eq("id", id).single();
  if (!existing) return { error: "일정을 찾을 수 없습니다." };
  if (existing.user_id !== userId && !isAdmin) return { error: "수정 권한이 없습니다." };

  const baseDate = String(formData.get("base_date") ?? "").trim();
  if (!isValidDate(baseDate)) return { error: "날짜 형식이 올바르지 않습니다." };

  const { tripStart, tripEnd } = readTripRange(formData, baseDate);
  if (!isValidDate(tripStart) || !isValidDate(tripEnd)) {
    return { error: "기간 날짜 형식이 올바르지 않습니다." };
  }
  if (tripStart > tripEnd) return { error: "시작일은 종료일보다 늦을 수 없습니다." };

  const department = String(formData.get("department") ?? "").trim();
  if (!department) return { error: "부서를 선택해주세요." };

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "내용을 입력해주세요." };

  const { error } = await supabase
    .from("schedules")
    .update({
      department,
      content,
      base_date: baseDate,
      trip_start: tripStart,
      trip_end: tripEnd,
    })
    .eq("id", id);

  if (error) return { error: "수정 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "UPDATE_SCHEDULE",
    message: `${actorName}님이 일정을 수정했습니다: ${content}`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/schedule");
  redirect(`/schedule?ym=${baseDate.slice(0, 7)}&date=${baseDate}`);
}

export async function deleteSchedule(id: string, ym: string): Promise<void> {
  const { supabase, userId, isAdmin, actorName } = await getViewer();

  const { data: existing } = await supabase.from("schedules").select("user_id, content").eq("id", id).single();

  if (existing && (existing.user_id === userId || isAdmin)) {
    await supabase.from("schedules").delete().eq("id", id);
    await writeLog({
      level: "info",
      action: "DELETE_SCHEDULE",
      message: `${actorName}님이 일정을 삭제했습니다: ${existing.content}`,
      actorId: userId,
      actorName,
    });
    revalidatePath("/schedule");
  }

  redirect(`/schedule?ym=${ym}`);
}
