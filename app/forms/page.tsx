import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const DOC_TYPES = [
  {
    label: "지출결의서",
    description: "지출 내역과 금액을 정리해 결재를 받는 문서",
    href: "/forms/expense",
    available: true,
  },
  {
    label: "사내 공지문",
    description: "준비 중입니다.",
    href: "#",
    available: false,
  },
  {
    label: "기획안 초안",
    description: "준비 중입니다.",
    href: "#",
    available: false,
  },
] as const;

export default async function FormsHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">양식 문서 작성</h1>
          <p className="mt-1 text-base text-[#6B6455]">사내 서류를 정해진 양식에 맞춰 작성하고 인쇄할 수 있습니다.</p>
        </div>
        <Link
          href="/forms/stamp"
          className="rounded-xl border border-[#E7E2D2] bg-white px-5 py-3 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
        >
          내 도장 등록
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOC_TYPES.map((doc) =>
          doc.available ? (
            <Link
              key={doc.label}
              href={doc.href}
              className="rounded-2xl border border-[#E7E2D2] bg-white p-5 transition-colors hover:border-[#0F5C56]"
            >
              <div className="text-lg font-bold text-[#211D14]">{doc.label}</div>
              <p className="mt-1.5 text-sm text-[#6B6455]">{doc.description}</p>
            </Link>
          ) : (
            <div key={doc.label} className="cursor-not-allowed rounded-2xl border border-[#E7E2D2] bg-[#FAF8F0] p-5 opacity-60">
              <div className="text-lg font-bold text-[#211D14]">{doc.label}</div>
              <p className="mt-1.5 text-sm text-[#6B6455]">{doc.description}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
