"use client";

import { useActionState, useState } from "react";

import { runBulkAction } from "@/app/customers/actions";
import type { CustomerListItem } from "@/lib/customers/types";
import CustomerTable from "./customer-table";
import CustomerCards from "./customer-cards";

type Props = {
  customers: CustomerListItem[];
  ownerMap: Map<string, string | null>;
  cardImageMap: Map<string, string>;
  lastContactMap: Map<string, string>;
  today: string;
  sort: string;
  dir: "asc" | "desc";
  baseParams: string;
  categories: { id: string; label: string }[];
};

type Panel = "category" | "contact" | "delete" | null;

const CONTACT_METHODS = ["문자", "전화", "이메일", "방문", "기타"];

const HiddenIds = ({ ids }: { ids: string[] }) => (
  <>
    {ids.map((id) => (
      <input key={id} type="hidden" name="ids" value={id} />
    ))}
  </>
);

const selectCls =
  "rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]";

const CustomerListSection = ({
  customers,
  ownerMap,
  cardImageMap,
  lastContactMap,
  today,
  sort,
  dir,
  baseParams,
  categories,
}: Props) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [panel, setPanel] = useState<Panel>(null);
  const [state, formAction, isPending] = useActionState(runBulkAction, null);

  const buildSortHref = (column: string) => {
    const p = new URLSearchParams(baseParams);
    p.set("sort", column);
    p.set("dir", sort === column && dir === "asc" ? "desc" : "asc");
    return `/customers?${p.toString()}`;
  };

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => (prev.size === customers.length ? new Set() : new Set(customers.map((c) => c.id))));
  };

  const ids = Array.from(selectedIds);

  const closeAfterSubmit = () => {
    setSelectedIds(new Set());
    setPanel(null);
  };

  return (
    <div className="space-y-3">
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#0F5C56] bg-[#E3EFEC] px-4 py-3">
          <span className="text-base font-medium text-[#0F5C56]">{selectedIds.size}건 선택됨</span>
          <button
            type="button"
            onClick={() => setPanel(panel === "category" ? null : "category")}
            className="rounded-lg border border-[#0F5C56] bg-white px-3 py-1.5 text-sm font-medium text-[#0F5C56] hover:bg-[#F5F3EA]"
          >
            구분 변경
          </button>
          <button
            type="button"
            onClick={() => setPanel(panel === "contact" ? null : "contact")}
            className="rounded-lg border border-[#0F5C56] bg-white px-3 py-1.5 text-sm font-medium text-[#0F5C56] hover:bg-[#F5F3EA]"
          >
            연락 기록 추가
          </button>
          <button
            type="button"
            onClick={() => setPanel(panel === "delete" ? null : "delete")}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-sm text-[#8A8270] hover:text-[#4B4739]"
          >
            선택 해제
          </button>
        </div>
      )}

      {panel === "category" && (
        <form
          action={formAction}
          onSubmit={closeAfterSubmit}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E7E2D2] bg-white px-4 py-3"
        >
          <input type="hidden" name="kind" value="category" />
          <HiddenIds ids={ids} />
          <select name="category" required className={selectCls}>
            <option value="" disabled>
              구분 선택
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#0F5C56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:opacity-60"
          >
            적용
          </button>
        </form>
      )}

      {panel === "contact" && (
        <form
          action={formAction}
          onSubmit={closeAfterSubmit}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E7E2D2] bg-white px-4 py-3"
        >
          <input type="hidden" name="kind" value="contact" />
          <HiddenIds ids={ids} />
          <input type="date" name="contact_date" required className={selectCls} />
          <select name="method" required className={selectCls}>
            <option value="" disabled>
              방법 선택
            </option>
            {CONTACT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input name="memo" placeholder="상세 내용 (선택)" className={`min-w-0 flex-1 ${selectCls}`} />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#0F5C56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:opacity-60"
          >
            적용
          </button>
        </form>
      )}

      {panel === "delete" && (
        <form
          action={formAction}
          onSubmit={closeAfterSubmit}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <input type="hidden" name="kind" value="delete" />
          <HiddenIds ids={ids} />
          <span className="text-base text-red-700">선택한 {ids.length}건을 삭제할까요? (본인이 등록했거나 관리자만 삭제됩니다)</span>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            삭제 확정
          </button>
        </form>
      )}

      {state && (
        <p className="text-sm text-[#6B6455]">
          {state.error
            ? state.error
            : `처리 완료: ${state.successCount}건 성공${state.skipCount > 0 ? `, ${state.skipCount}건 권한 없음/실패로 제외` : ""}`}
        </p>
      )}

      <CustomerTable
        customers={customers}
        ownerMap={ownerMap}
        cardImageMap={cardImageMap}
        lastContactMap={lastContactMap}
        today={today}
        sort={sort}
        dir={dir}
        buildSortHref={buildSortHref}
        selectedIds={selectedIds}
        onToggle={toggle}
        onToggleAll={toggleAll}
      />
      <CustomerCards customers={customers} ownerMap={ownerMap} selectedIds={selectedIds} onToggle={toggle} />
    </div>
  );
};

export default CustomerListSection;
