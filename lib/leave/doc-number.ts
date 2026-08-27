import type { createClient } from "@/lib/supabase/server";
import { todayKst } from "@/lib/report/date";

// "LEA-20260827-001" 형태. 같은 날짜에 만들어진 문서 수를 세어 순번을 매긴다.
export async function generateDocNumber(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const today = todayKst();
  const dateCompact = today.replaceAll("-", "");
  const dayStart = `${today}T00:00:00.000Z`;
  const dayEnd = `${today}T23:59:59.999Z`;

  const { count } = await supabase
    .from("leave_requests")
    .select("id", { count: "exact", head: true })
    .gte("created_at", dayStart)
    .lte("created_at", dayEnd);

  const seq = String((count ?? 0) + 1).padStart(3, "0");
  return `LEA-${dateCompact}-${seq}`;
}
