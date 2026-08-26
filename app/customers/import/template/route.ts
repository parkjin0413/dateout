import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const header = ["구분", "이름", "소속", "연락처", "이메일", "메모"];
  const csv = header.join(",");
  const BOM = String.fromCharCode(0xfeff);

  return new NextResponse(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers_template.csv"`,
    },
  });
}
