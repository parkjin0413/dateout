"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";

import type { CustomerListItem } from "@/lib/customers/types";

type Props = {
  customers: CustomerListItem[];
  ownerMap: Map<string, string | null>;
  cardImageMap: Map<string, string>;
  sort: string;
  dir: "asc" | "desc";
  buildSortHref: (column: string) => string;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
};

const COLUMNS: { key: string; label: string }[] = [
  { key: "category", label: "구분" },
  { key: "name", label: "이름" },
  { key: "company", label: "소속" },
  { key: "phone", label: "연락처" },
  { key: "email", label: "이메일" },
];

const CustomerTable = ({
  customers,
  ownerMap,
  cardImageMap,
  sort,
  dir,
  buildSortHref,
  selectedIds,
  onToggle,
  onToggleAll,
}: Props) => {
  const allSelected = customers.length > 0 && selectedIds.size === customers.length;
  const [hover, setHover] = useState<{ id: string; top: number; left: number } | null>(null);

  const showPreview = (id: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setHover({ id, top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
  };

  const hideOwnPreview = (id: string) => {
    setHover((h) => (h?.id === id ? null : h));
  };

  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-[#E7E2D2] bg-white md:block">
      <table className="w-full min-w-[900px] text-base">
        <thead>
          <tr className="border-b border-[#E7E2D2] text-left text-sm text-[#8A8270]">
            <th className="w-10 px-4 py-4">
              <input type="checkbox" checked={allSelected} onChange={onToggleAll} aria-label="전체 선택" />
            </th>
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-4 py-4 font-medium">
                <Link href={buildSortHref(col.key)} className="inline-flex items-center gap-1 hover:text-[#4B4739]">
                  {col.label}
                  {sort === col.key && <span>{dir === "asc" ? "▲" : "▼"}</span>}
                </Link>
              </th>
            ))}
            <th className="px-4 py-4 font-medium">담당자</th>
            <th className="px-4 py-4 font-medium" />
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-base text-[#8A8270]">
                등록된 고객이 없습니다.
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id} className="border-b border-[#EDE7D3] text-[#4B4739]">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(customer.id)}
                    onChange={() => onToggle(customer.id)}
                    aria-label={`${customer.name} 선택`}
                  />
                </td>
                <td className="px-4 py-4">{customer.category}</td>
                <td className="px-4 py-4">
                  {cardImageMap.has(customer.id) ? (
                    <span
                      className="inline-block"
                      onMouseEnter={(e) => showPreview(customer.id, e.currentTarget)}
                      onMouseLeave={() => hideOwnPreview(customer.id)}
                    >
                      <Link href={`/customers/${customer.id}`} className="font-medium text-[#211D14] hover:underline">
                        {customer.name}
                      </Link>
                    </span>
                  ) : (
                    <Link href={`/customers/${customer.id}`} className="font-medium text-[#211D14] hover:underline">
                      {customer.name}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-4">{customer.company}</td>
                <td className="px-4 py-4">
                  <a href={`tel:${customer.phone}`} className="hover:text-[#0F5C56]">
                    {customer.phone}
                  </a>
                </td>
                <td className="px-4 py-4">
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} className="hover:text-[#0F5C56]">
                      {customer.email}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-4 text-[#6B6455]">{ownerMap.get(customer.owner_id ?? "") ?? "담당자 미지정"}</td>
                <td className="px-4 py-4">
                  <Link href={`/customers/${customer.id}`} className="text-sm font-medium text-[#4B4739] hover:text-[#211D14]">
                    상세
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {hover &&
        cardImageMap.has(hover.id) &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 rounded-lg border border-[#E7E2D2] bg-white p-2 shadow-lg"
            style={{ top: hover.top, left: hover.left }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- 비공개 버킷 서명 URL, next/image 원격 도메인 설정 불필요 */}
            <img
              src={cardImageMap.get(hover.id)}
              alt="명함 사진"
              className="h-32 w-52 rounded-md bg-[#F5F3EA] object-contain"
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomerTable;
