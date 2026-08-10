import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { enumerateDates } from "@/lib/field-trip/date";
import { getDeptLabel } from "@/lib/field-trip/dept";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const yearParam = Number(searchParams.get("year"));
  const currentYear = new Date().getUTCFullYear();
  const year = Number.isInteger(yearParam) && yearParam >= 2000 && yearParam <= 2100 ? yearParam : currentYear;

  const rangeStart = `${year}-01-01`;
  const rangeEnd = `${year}-12-31`;

  const { data: rows } = await supabase
    .from("field_trips")
    .select("*")
    .lte("trip_start", rangeEnd)
    .gte("trip_end", rangeStart)
    .order("base_date", { ascending: true });

  const header = [
    "일자",
    "일차",
    "기간일수",
    "기준일",
    "출발일",
    "도착일",
    "부서",
    "성명",
    "행선지",
    "출발시간",
    "복귀시간",
    "비고1",
    "비고2",
    "비고3",
    "비고4",
    "작성일",
    "ID",
  ];
  const lines: string[][] = [header];

  for (const row of rows ?? []) {
    const fullDates = enumerateDates(row.trip_start, row.trip_end);

    const clampStart = row.trip_start < rangeStart ? rangeStart : row.trip_start;
    const clampEnd = row.trip_end > rangeEnd ? rangeEnd : row.trip_end;
    if (clampStart > clampEnd) continue;

    for (const day of enumerateDates(clampStart, clampEnd)) {
      const dayNo = fullDates.indexOf(day) + 1;
      lines.push([
        day,
        String(dayNo),
        String(fullDates.length),
        row.base_date,
        row.trip_start,
        row.trip_end,
        getDeptLabel(row.department),
        row.author_name,
        row.destination,
        row.depart_time,
        row.return_time,
        row.remark_1,
        row.remark_2,
        row.remark_3,
        row.remark_4,
        row.created_at,
        row.id,
      ]);
    }
  }

  const csv = lines.map((line) => line.map(csvEscape).join(",")).join("\r\n");
  const BOM = String.fromCharCode(0xfeff);
  const body = BOM + csv;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="field_trips_${year}.csv"`,
    },
  });
}
