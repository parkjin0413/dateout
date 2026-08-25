"use client";

import { reassignOwner } from "@/app/customers/actions";

type Props = {
  customerId: string;
  employees: { id: string; name: string | null; email: string }[];
  currentOwnerId: string | null;
};

const ReassignOwnerForm = ({ customerId, employees, currentOwnerId }: Props) => {
  const boundReassign = reassignOwner.bind(null, customerId);

  return (
    <form action={boundReassign} className="flex flex-col gap-2">
      <select
        name="owner_id"
        defaultValue={currentOwnerId ?? ""}
        className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]"
      >
        <option value="">담당자 미지정</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name ?? e.email}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-sm font-medium text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
      >
        저장
      </button>
    </form>
  );
};

export default ReassignOwnerForm;
