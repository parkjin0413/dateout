"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isValidDate } from "@/lib/field-trip/date";

export type FieldTripFormState = { error: string } | null;

async function getViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("users")
    .select("name, is_admin")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    userId: user.id,
    name: profile?.name ?? user.email ?? "",
    isAdmin: profile?.is_admin ?? false,
  };
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

function readCommonFields(formData: FormData) {
  return {
    department: String(formData.get("department") ?? "").trim(),
    destination: String(formData.get("destination") ?? "").trim(),
    departTime: String(formData.get("depart_time") ?? "").trim(),
    returnTime: String(formData.get("return_time") ?? "").trim(),
    remark1: String(formData.get("remark_1") ?? "").trim(),
    remark2: String(formData.get("remark_2") ?? "").trim(),
    remark3: String(formData.get("remark_3") ?? "").trim(),
    remark4: String(formData.get("remark_4") ?? "").trim(),
  };
}

export async function createFieldTrip(
  _prevState: FieldTripFormState,
  formData: FormData
): Promise<FieldTripFormState> {
  const { supabase, userId, name, isAdmin } = await getViewer();

  const baseDate = String(formData.get("base_date") ?? "").trim();
  if (!isValidDate(baseDate)) return { error: "날짜 형식이 올바르지 않습니다." };

  const { tripStart, tripEnd } = readTripRange(formData, baseDate);
  if (!isValidDate(tripStart) || !isValidDate(tripEnd)) {
    return { error: "출장 기간 날짜 형식이 올바르지 않습니다." };
  }
  if (tripStart > tripEnd) return { error: "출발일은 도착일보다 늦을 수 없습니다." };

  const { department, destination, departTime, returnTime, remark1, remark2, remark3, remark4 } =
    readCommonFields(formData);

  if (!department) return { error: "부서를 선택해주세요." };
  if (!departTime || !returnTime) return { error: "출발/복귀 시간을 입력해주세요." };

  const authorName = isAdmin
    ? String(formData.get("author_name") ?? "").trim() || name
    : name;

  const { count, error: countError } = await supabase
    .from("field_trips")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("trip_start", tripEnd)
    .gte("trip_end", tripStart);

  if (countError) return { error: "일정 확인 중 오류가 발생했습니다." };
  if ((count ?? 0) > 0) return { error: "이미 해당 기간과 겹치는 외근/출장 일정이 있습니다." };

  const { error } = await supabase.from("field_trips").insert({
    user_id: userId,
    author_name: authorName,
    department,
    destination,
    depart_time: departTime,
    return_time: returnTime,
    remark_1: remark1,
    remark_2: remark2,
    remark_3: remark3,
    remark_4: remark4,
    base_date: baseDate,
    trip_start: tripStart,
    trip_end: tripEnd,
  });

  if (error) return { error: "등록 중 오류가 발생했습니다." };

  revalidatePath("/field-trip");
  redirect(`/field-trip?date=${baseDate}&ym=${baseDate.slice(0, 7)}`);
}

export async function updateFieldTrip(
  id: string,
  _prevState: FieldTripFormState,
  formData: FormData
): Promise<FieldTripFormState> {
  const { supabase, userId, isAdmin } = await getViewer();

  const { data: existing } = await supabase
    .from("field_trips")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing) return { error: "일정을 찾을 수 없습니다." };
  if (existing.user_id !== userId && !isAdmin) return { error: "수정 권한이 없습니다." };

  const baseDate = String(formData.get("base_date") ?? "").trim();
  if (!isValidDate(baseDate)) return { error: "날짜 형식이 올바르지 않습니다." };

  const { tripStart, tripEnd } = readTripRange(formData, baseDate);
  if (!isValidDate(tripStart) || !isValidDate(tripEnd)) {
    return { error: "출장 기간 날짜 형식이 올바르지 않습니다." };
  }
  if (tripStart > tripEnd) return { error: "출발일은 도착일보다 늦을 수 없습니다." };

  const { department, destination, departTime, returnTime, remark1, remark2, remark3, remark4 } =
    readCommonFields(formData);

  if (!department) return { error: "부서를 선택해주세요." };
  if (!departTime || !returnTime) return { error: "출발/복귀 시간을 입력해주세요." };

  const authorName = isAdmin ? String(formData.get("author_name") ?? "").trim() : undefined;

  const { count, error: countError } = await supabase
    .from("field_trips")
    .select("id", { count: "exact", head: true })
    .eq("user_id", existing.user_id)
    .neq("id", id)
    .lte("trip_start", tripEnd)
    .gte("trip_end", tripStart);

  if (countError) return { error: "일정 확인 중 오류가 발생했습니다." };
  if ((count ?? 0) > 0) return { error: "이미 해당 기간과 겹치는 외근/출장 일정이 있습니다." };

  const { error } = await supabase
    .from("field_trips")
    .update({
      ...(authorName ? { author_name: authorName } : {}),
      department,
      destination,
      depart_time: departTime,
      return_time: returnTime,
      remark_1: remark1,
      remark_2: remark2,
      remark_3: remark3,
      remark_4: remark4,
      base_date: baseDate,
      trip_start: tripStart,
      trip_end: tripEnd,
    })
    .eq("id", id);

  if (error) return { error: "수정 중 오류가 발생했습니다." };

  revalidatePath("/field-trip");
  redirect(`/field-trip?date=${baseDate}&ym=${baseDate.slice(0, 7)}`);
}

export async function deleteFieldTrip(id: string, date: string, ym: string): Promise<void> {
  const { supabase, userId, isAdmin } = await getViewer();

  const { data: existing } = await supabase
    .from("field_trips")
    .select("user_id")
    .eq("id", id)
    .single();

  if (existing && (existing.user_id === userId || isAdmin)) {
    await supabase.from("field_trips").delete().eq("id", id);
    revalidatePath("/field-trip");
  }

  redirect(`/field-trip?date=${date}&ym=${ym}`);
}
