"use client";

import { useActionState } from "react";
import Link from "next/link";

import { importCustomers } from "@/app/customers/actions";

const CustomerImportForm = () => {
  const [state, formAction, isPending] = useActionState(importCustomers, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-5 rounded-2xl border border-[#E7E2D2] bg-white p-6">
      <div>
        <label className="mb-1.5 block text-base font-medium text-[#4B4739]">CSV 파일</label>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#F5F3EA] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#4B4739]"
        />
      </div>

      {state?.error && <p className="text-base text-red-600">{state.error}</p>}

      {state && !state.error && (
        <div className="rounded-lg border border-[#E7E2D2] bg-[#F5F3EA] p-4 text-sm text-[#4B4739]">
          <p>
            총 {state.total}건 중 {state.successCount}건 등록, {state.failures.length}건 실패
          </p>
          {state.failures.length > 0 && (
            <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto text-red-600">
              {state.failures.map((f) => (
                <li key={f.row}>
                  {f.row}행: {f.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#0F5C56] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "등록 중..." : "업로드"}
        </button>
        <Link href="/customers" className="text-base text-[#6B6455] transition-colors hover:text-[#211D14]">
          목록으로
        </Link>
      </div>
    </form>
  );
};

export default CustomerImportForm;
