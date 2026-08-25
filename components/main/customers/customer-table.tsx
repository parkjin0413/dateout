import Link from "next/link";

import type { CustomerListItem } from "@/lib/customers/types";

type Props = {
  customers: CustomerListItem[];
  ownerMap: Map<string, string | null>;
  sort: string;
  dir: "asc" | "desc";
  buildSortHref: (column: string) => string;
};

const COLUMNS: { key: string; label: string }[] = [
  { key: "category", label: "구분" },
  { key: "name", label: "이름" },
  { key: "company", label: "소속" },
  { key: "phone", label: "연락처" },
  { key: "email", label: "이메일" },
];

const CustomerTable = ({ customers, ownerMap, sort, dir, buildSortHref }: Props) => {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-[#E7E2D2] bg-white md:block">
      <table className="w-full min-w-[860px] text-base">
        <thead>
          <tr className="border-b border-[#E7E2D2] text-left text-sm text-[#8A8270]">
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
              <td colSpan={7} className="px-4 py-12 text-center text-base text-[#8A8270]">
                등록된 고객이 없습니다.
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id} className="border-b border-[#EDE7D3] text-[#4B4739]">
                <td className="px-4 py-4">{customer.category}</td>
                <td className="px-4 py-4">
                  <Link href={`/customers/${customer.id}`} className="font-medium text-[#211D14] hover:underline">
                    {customer.name}
                  </Link>
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
    </div>
  );
};

export default CustomerTable;
