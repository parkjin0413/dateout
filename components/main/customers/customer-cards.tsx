import Link from "next/link";

import type { CustomerListItem } from "@/lib/customers/types";

type Props = {
  customers: CustomerListItem[];
  ownerMap: Map<string, string | null>;
};

const CustomerCards = ({ customers, ownerMap }: Props) => {
  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E7E2D2] bg-white px-4 py-12 text-center text-base text-[#8A8270] md:hidden">
        등록된 고객이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {customers.map((customer) => (
        <Link
          key={customer.id}
          href={`/customers/${customer.id}`}
          className="block rounded-2xl border border-[#E7E2D2] bg-white p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-[#CFE3E0] bg-[#E3EFEC] px-2.5 py-0.5 text-xs font-medium text-[#0F5C56]">
              {customer.category}
            </span>
            <span className="font-semibold text-[#211D14]">{customer.name}</span>
            <span className="text-base text-[#6B6455]">{customer.company}</span>
          </div>
          <div className="mt-2 text-base text-[#4B4739]">{customer.phone}</div>
          {customer.email && <div className="text-sm text-[#8A8270]">{customer.email}</div>}
          <div className="mt-2 text-sm text-[#8A8270]">담당자: {ownerMap.get(customer.owner_id ?? "") ?? "미지정"}</div>
        </Link>
      ))}
    </div>
  );
};

export default CustomerCards;
