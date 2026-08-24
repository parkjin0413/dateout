"use server";

import { createClient } from "@/lib/supabase/server";
import { writeLog } from "@/lib/logs";

export async function logLogin(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase.from("users").select("name").eq("id", user.id).single();
  const name = profile?.name ?? user.email ?? "알 수 없음";

  await writeLog({
    level: "info",
    action: "LOGIN",
    message: `${name}님이 로그인했습니다.`,
    actorId: user.id,
    actorName: name,
  });
}
