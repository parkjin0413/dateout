import type { createClient } from "@/lib/supabase/server";
import { todayKst } from "@/lib/report/date";

// "EXP-20260827-1234-01" 형태. 같은 날짜/기안자 조합으로 만들어진 문서 수를 세어 순번을 매긴다.
export async function generateDocNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  drafterId: string,
  phone: string | null
): Promise<string> {
  const today = todayKst();
  const dateCompact = today.replaceAll("-", "");
  const dayStart = `${today}T00:00:00+09:00`;
  const dayEnd = `${today}T23:59:59+09:00`;
  const digits = (phone ?? "").replace(/\D/g, "");
  const suffix = digits.length >= 4 ? digits.slice(-4) : "0000";

  const { count } = await supabase
    .from("expense_reports")
    .select("id", { count: "exact", head: true })
    .eq("drafter_id", drafterId)
    .gte("created_at", dayStart)
    .lte("created_at", dayEnd);

  const seq = String((count ?? 0) + 1).padStart(2, "0");
  return `EXP-${dateCompact}-${suffix}-${seq}`;
}
