import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { csvEscape } from "@/lib/customers/csv";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const selectedCategories = searchParams.getAll("category");

  let query = supabase.from("customers").select("category, name, company, phone, email, memo, owner_id, created_at");

  if (q) {
    const safeQ = q.replace(/[,()]/g, " ").trim();
    if (safeQ) {
      query = query.or(`name.ilike.%${safeQ}%,company.ilike.%${safeQ}%,phone.ilike.%${safeQ}%,email.ilike.%${safeQ}%`);
    }
  }
  if (selectedCategories.length > 0) {
    query = query.in("category", selectedCategories);
  }

  const { data: rows } = await query.order("created_at", { ascending: false });
  const customers = rows ?? [];

  const ownerIds = Array.from(new Set(customers.map((c) => c.owner_id).filter((id): id is string => !!id)));
  const { data: owners } =
    ownerIds.length > 0 ? await supabase.from("users").select("id, name, email").in("id", ownerIds) : { data: [] };
  const ownerMap = new Map((owners ?? []).map((o) => [o.id, o.name ?? o.email]));

  const header = ["구분", "이름", "소속", "연락처", "이메일", "메모", "담당자", "등록일"];
  const lines: string[][] = [header];
  for (const c of customers) {
    lines.push([
      c.category,
      c.name,
      c.company,
      c.phone,
      c.email,
      c.memo,
      ownerMap.get(c.owner_id ?? "") ?? "담당자 미지정",
      c.created_at,
    ]);
  }

  const csv = lines.map((line) => line.map(csvEscape).join(",")).join("\r\n");
  const BOM = String.fromCharCode(0xfeff);

  return new NextResponse(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers.csv"`,
    },
  });
}
