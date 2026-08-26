import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CustomerListSection from "@/components/main/customers/customer-list-section";

const PAGE_SIZE = 25;
const SORTABLE_COLUMNS = ["category", "name", "company", "phone", "email", "created_at"] as const;
type SortColumn = (typeof SORTABLE_COLUMNS)[number];

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string | string[];
    sort?: string;
    dir?: string;
    page?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const selectedCategories = params.category
    ? Array.isArray(params.category)
      ? params.category
      : [params.category]
    : [];
  const sort: SortColumn = (SORTABLE_COLUMNS as readonly string[]).includes(params.sort ?? "")
    ? (params.sort as SortColumn)
    : "created_at";
  const dir: "asc" | "desc" = params.dir === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(params.page) || 1);

  const { data: categoryRows } = await supabase
    .from("customer_categories")
    .select("id, label")
    .order("sort_order", { ascending: true });
  const categories = categoryRows ?? [];

  let query = supabase
    .from("customers")
    .select("id, owner_id, category, name, company, phone, email, created_at", { count: "exact" });

  if (q) {
    const safeQ = q.replace(/[,()]/g, " ").trim();
    if (safeQ) {
      query = query.or(`name.ilike.%${safeQ}%,company.ilike.%${safeQ}%,phone.ilike.%${safeQ}%,email.ilike.%${safeQ}%`);
    }
  }
  if (selectedCategories.length > 0) {
    query = query.in("category", selectedCategories);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const orderColumn = sort === "phone" ? "phone_normalized" : sort;
  query = query.order(orderColumn, { ascending: dir === "asc" }).range(from, to);

  const { data: rows, count } = await query;
  const customers = rows ?? [];

  const ownerIds = Array.from(new Set(customers.map((c) => c.owner_id).filter((id): id is string => !!id)));
  const { data: owners } =
    ownerIds.length > 0 ? await supabase.from("users").select("id, name, email").in("id", ownerIds) : { data: [] };
  const ownerMap = new Map((owners ?? []).map((o) => [o.id, o.name ?? o.email]));

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  for (const c of selectedCategories) baseParams.append("category", c);

  const buildPageHref = (targetPage: number) => {
    const p = new URLSearchParams(baseParams);
    p.set("sort", sort);
    p.set("dir", dir);
    p.set("page", String(targetPage));
    return `/customers?${p.toString()}`;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">고객관리</h1>
          <p className="mt-1 text-base text-[#6B6455]">전 직원이 등록한 고객을 함께 확인하고, 본인이 등록한 고객을 관리하세요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/customers/stats"
            className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            통계
          </Link>
          <Link
            href="/customers/import"
            className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            일괄등록
          </Link>
          <Link
            href={`/customers/export?${baseParams.toString()}`}
            className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            내보내기
          </Link>
          <Link
            href="/customers/categories"
            className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            구분 관리
          </Link>
          <Link
            href="/customers/new"
            className="rounded-lg bg-[#0F5C56] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
          >
            + 고객 등록
          </Link>
        </div>
      </div>

      <form method="get" className="mb-4 space-y-3 rounded-2xl border border-[#E7E2D2] bg-white p-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="이름, 소속, 연락처, 이메일로 검색"
          className="w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none placeholder:text-[#B9B29B]"
        />
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 text-sm text-[#4B4739]">
                <input type="checkbox" name="category" value={c.label} defaultChecked={selectedCategories.includes(c.label)} />
                {c.label}
              </label>
            ))}
          </div>
        )}
        <button
          type="submit"
          className="rounded-lg bg-[#0F5C56] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
        >
          검색
        </button>
      </form>

      <CustomerListSection
        customers={customers}
        ownerMap={ownerMap}
        sort={sort}
        dir={dir}
        baseParams={baseParams.toString()}
        categories={categories}
      />

      <div className="mt-4 flex items-center justify-between text-sm text-[#6B6455]">
        <span>
          총 {totalCount}명 중 {customers.length === 0 ? 0 : from + 1}–{Math.min(to + 1, totalCount)}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`rounded-lg border border-[#E7E2D2] bg-white px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-[#F5F3EA]"}`}
          >
            이전
          </Link>
          <span>
            {page} / {totalPages}
          </span>
          <Link
            href={buildPageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={`rounded-lg border border-[#E7E2D2] bg-white px-3 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-[#F5F3EA]"}`}
          >
            다음
          </Link>
        </div>
      </div>
    </div>
  );
}
