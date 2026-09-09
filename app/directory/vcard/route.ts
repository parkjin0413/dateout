import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { compareEmployees } from "@/lib/directory/dept";

// vCard 값에 들어갈 수 있는 특수문자(\ ; , 줄바꿈)를 RFC 6350 규칙대로 이스케이프한다.
function vEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

// 휴대폰 연락처에 저장될 이름: "홍길동 (영업1부 과장)". 부서·직급이 없으면 있는 것만 붙인다.
function contactName(e: { name: string; department: string; job_title: string }): string {
  const suffix = [e.department, e.job_title]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" ");
  return suffix ? `${e.name} (${suffix})` : e.name;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  let query = supabase.from("employees").select("name, company, department, job_title, phone, direct_line");
  if (q) {
    const safeQ = q.replace(/[,()]/g, " ").trim();
    if (safeQ) {
      query = query.or(
        `name.ilike.%${safeQ}%,department.ilike.%${safeQ}%,job_title.ilike.%${safeQ}%,company.ilike.%${safeQ}%,work_location.ilike.%${safeQ}%`
      );
    }
  }

  const { data: rows } = await query;
  const employees = (rows ?? []).slice().sort(compareEmployees);

  const cards: string[] = [];
  for (const e of employees) {
    const cell = (e.phone ?? "").trim();
    const work = (e.direct_line ?? "").trim();
    if (!cell && !work) continue;

    const display = contactName(e);
    const card = ["BEGIN:VCARD", "VERSION:3.0", `N:;${vEscape(display)};;;`, `FN:${vEscape(display)}`];
    if ((e.company ?? "").trim()) card.push(`ORG:${vEscape(e.company.trim())}`);
    if ((e.job_title ?? "").trim()) card.push(`TITLE:${vEscape(e.job_title.trim())}`);
    if (cell) card.push(`TEL;TYPE=CELL:${cell}`);
    if (work) card.push(`TEL;TYPE=WORK:${work}`);
    card.push("END:VCARD");
    cards.push(card.join("\r\n"));
  }

  const body = cards.length ? cards.join("\r\n") + "\r\n" : "";
  const filename = "강산이엔지-직원명부.vcf";

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="kseng-directory.vcf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
