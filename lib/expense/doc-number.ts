import type { createClient } from "@/lib/supabase/server";

// "홍보부-2026-01" 형태. 같은 부서·연도 조합으로 만들어진 품의서 수를 세어 순번을 매긴다.
export async function generateDocNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  department: string,
  draftedAt: string
): Promise<string> {
  const dept = department || "미지정";
  const year = draftedAt.slice(0, 4);
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const { count } = await supabase
    .from("expense_reports")
    .select("id", { count: "exact", head: true })
    .eq("department", department)
    .gte("drafted_at", yearStart)
    .lte("drafted_at", yearEnd);

  const seq = String((count ?? 0) + 1).padStart(2, "0");
  return `${dept}-${year}-${seq}`;
}
