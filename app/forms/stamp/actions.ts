"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { STAMP_BUCKET, buildStampPath } from "@/lib/expense/stamp-image";
import { writeLog } from "@/lib/logs";

async function getViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("name, stamp_path").eq("id", user.id).single();
  return { supabase, userId: user.id, actorName: profile?.name ?? user.email ?? "알 수 없음", stampPath: profile?.stamp_path ?? null };
}

export type StampFormState = { error: string } | null;

export async function uploadStamp(_prevState: StampFormState, formData: FormData): Promise<StampFormState> {
  const { supabase, userId, actorName, stampPath } = await getViewer();

  const file = formData.get("stamp_image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "도장 이미지를 선택해주세요." };
  }

  const path = buildStampPath(userId, file.name);
  const { error: uploadError } = await supabase.storage.from(STAMP_BUCKET).upload(path, file);
  if (uploadError) return { error: "업로드 중 오류가 발생했습니다." };

  if (stampPath) {
    await supabase.storage.from(STAMP_BUCKET).remove([stampPath]);
  }
  await supabase.from("users").update({ stamp_path: path }).eq("id", userId);

  await writeLog({
    level: "info",
    action: "UPLOAD_STAMP",
    message: `${actorName}님이 도장을 등록했습니다.`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/forms/stamp");
  return null;
}

export async function removeStamp(): Promise<void> {
  const { supabase, userId, actorName, stampPath } = await getViewer();
  if (!stampPath) redirect("/forms/stamp");

  await supabase.storage.from(STAMP_BUCKET).remove([stampPath]);
  await supabase.from("users").update({ stamp_path: null }).eq("id", userId);

  await writeLog({
    level: "info",
    action: "REMOVE_STAMP",
    message: `${actorName}님이 도장을 삭제했습니다.`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/forms/stamp");
  redirect("/forms/stamp");
}
