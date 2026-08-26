import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CustomerImportForm from "@/components/main/customers/customer-import-form";

export default async function CustomerImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: categoryRows } = await supabase
    .from("customer_categories")
    .select("label")
    .order("sort_order", { ascending: true });
  const categories = (categoryRows ?? []).map((c) => c.label);

  return (
    <div>
      <div className="mb-6">
        <Link href="/customers" className="text-sm text-[#8A8270] transition-colors hover:text-[#4B4739]">
          ← 고객 목록
        </Link>
        <h1 className="mt-1 text-3xl font-bold text-[#211D14]">고객 일괄등록</h1>
        <p className="mt-1 text-base text-[#6B6455]">
          CSV 파일로 여러 명을 한 번에 등록합니다.{" "}
          <Link href="/customers/import/template" className="underline">
            템플릿 다운로드
          </Link>
        </p>
        {categories.length > 0 && <p className="mt-1 text-sm text-[#8A8270]">사용 가능한 구분: {categories.join(", ")}</p>}
      </div>

      <CustomerImportForm />
    </div>
  );
}
