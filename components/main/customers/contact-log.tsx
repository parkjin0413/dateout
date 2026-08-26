"use client";

import { useActionState } from "react";

import { createContact } from "@/app/customers/actions";
import type { CustomerContact } from "@/lib/customers/types";
import DeleteContactButton from "./delete-contact-button";

const METHODS = ["문자", "전화", "이메일", "방문", "기타"] as const;

type Props = {
  customerId: string;
  contacts: CustomerContact[];
  viewerId: string;
  isAdmin: boolean;
  today: string;
};

const ContactLog = ({ customerId, contacts, viewerId, isAdmin, today }: Props) => {
  const boundCreate = createContact.bind(null, customerId);
  const [state, formAction, isPending] = useActionState(boundCreate, null);

  return (
    <div className="rounded-2xl border border-[#E7E2D2] bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-[#211D14]">연락 기록</h2>

      <form action={formAction} className="mb-5 space-y-3 rounded-xl border border-[#E7E2D2] bg-[#FAF8F0] p-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            name="contact_date"
            required
            defaultValue={today}
            className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]"
          />
          <select
            name="method"
            required
            defaultValue=""
            className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]"
          >
            <option value="" disabled>
              연락 방법
            </option>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <input
          name="memo"
          placeholder="상세 내용 (선택)"
          className="w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]"
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#0F5C56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:opacity-60"
        >
          {isPending ? "저장 중..." : "기록 추가"}
        </button>
      </form>

      {contacts.length === 0 ? (
        <p className="text-base text-[#8A8270]">아직 연락 기록이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 border-b border-[#EDE7D3] pb-2 last:border-b-0">
              <div>
                <span className="text-sm font-medium text-[#211D14]">{c.contact_date}</span>{" "}
                <span className="text-sm text-[#0F5C56]">{c.method}</span>
                {c.memo && <p className="mt-0.5 text-sm text-[#6B6455]">{c.memo}</p>}
              </div>
              {(isAdmin || c.created_by === viewerId) && <DeleteContactButton id={c.id} customerId={customerId} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContactLog;
