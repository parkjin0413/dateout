"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";

import { createEmployeeAccount } from "@/app/admin/employees/actions";
import { DEPARTMENT_OPTIONS } from "@/lib/schedule/dept";

const EMAIL_DOMAIN = "ks.com";

const inputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-base font-medium text-[#4B4739]">{label}</label>
    {children}
  </div>
);

const EmployeeAccountForm = () => {
  const [state, formAction, isPending] = useActionState(createEmployeeAccount, null);
  const [phone, setPhone] = useState("");

  const digits = phone.replace(/\D/g, "");
  const previewEmail = digits.length >= 4 ? `${digits.slice(-4)}@${EMAIL_DOMAIN}` : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">직원 추가</h1>
        <p className="mt-1 text-base text-[#6B6455]">로그인 계정과 직원 정보를 함께 등록합니다.</p>
      </div>

      <form action={formAction} className="max-w-2xl space-y-5 rounded-2xl border border-[#E7E2D2] bg-white p-6">
        <Field label="이름">
          <input name="name" required className={inputCls} />
        </Field>

        <Field label="부서">
          <input name="department" list="employee-department-options" required placeholder="예) 영업부" className={inputCls} />
          <datalist id="employee-department-options">
            {DEPARTMENT_OPTIONS.filter((opt) => opt !== "공지").map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </Field>

        <Field label="직급">
          <input name="job_title" required placeholder="예) 대리, 과장, 팀장" className={inputCls} />
        </Field>

        <Field label="전화번호">
          <input
            name="phone"
            required
            placeholder="예) 01012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
          />
          <p className="mt-1 text-sm text-[#8A8270]">
            로그인 계정은 전화번호 뒷자리 4자리로 자동 생성됩니다.
            {previewEmail && (
              <>
                {" "}
                계정: <span className="font-mono font-semibold text-[#0F5C56]">{previewEmail}</span>
              </>
            )}
          </p>
        </Field>

        <Field label="비밀번호">
          <input name="password" type="password" required minLength={4} className={inputCls} />
          <p className="mt-1 text-sm text-[#8A8270]">4자 이상 입력해주세요. 등록 후 본인에게 전달해주세요.</p>
        </Field>

        {state?.error && <p className="text-base text-red-600">{state.error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#0F5C56] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "등록 중..." : "등록"}
          </button>
          <Link href="/admin/employees" className="text-base text-[#6B6455] transition-colors hover:text-[#211D14]">
            목록으로
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EmployeeAccountForm;
