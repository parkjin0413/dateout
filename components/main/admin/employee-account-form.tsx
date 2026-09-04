"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";

import type { EmployeeAccountFormState } from "@/app/admin/employees/actions";
import { COMPANY_OPTIONS } from "@/lib/company";
import { DEPARTMENT_OPTIONS } from "@/lib/schedule/dept";
import { WORK_LOCATION_OPTIONS } from "@/lib/work-location";

const EMAIL_DOMAIN = "ks.com";

const inputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-base font-medium text-[#4B4739]">{label}</label>
    {children}
  </div>
);

type Employee = {
  name: string | null;
  company: string;
  work_location: string;
  department: string;
  job_title: string;
  phone: string;
};

type Props = {
  mode: "create" | "edit";
  action: (state: EmployeeAccountFormState, formData: FormData) => Promise<EmployeeAccountFormState>;
  employee?: Employee;
};

const EmployeeAccountForm = ({ mode, action, employee }: Props) => {
  const [state, formAction, isPending] = useActionState(action, null);
  const [phone, setPhone] = useState(employee?.phone ?? "");

  const digits = phone.replace(/\D/g, "");
  const previewEmail = digits.length >= 4 ? `${digits.slice(-4)}@${EMAIL_DOMAIN}` : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">{mode === "create" ? "직원 추가" : "직원 정보 수정"}</h1>
        <p className="mt-1 text-base text-[#6B6455]">
          {mode === "create" ? "로그인 계정과 직원 정보를 함께 등록합니다." : "로그인 계정과 직원 정보를 수정합니다."}
        </p>
      </div>

      <form action={formAction} className="max-w-2xl space-y-5 rounded-2xl border border-[#E7E2D2] bg-white p-6">
        <Field label="이름">
          <input name="name" required defaultValue={employee?.name ?? ""} className={inputCls} />
        </Field>

        <Field label="소속">
          <select name="company" defaultValue={employee?.company ?? ""} className={inputCls}>
            {COMPANY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="">미선택</option>
          </select>
        </Field>

        <Field label="근무지">
          <select name="work_location" required defaultValue={employee?.work_location ?? ""} className={inputCls}>
            <option value="" disabled>
              선택하세요
            </option>
            {WORK_LOCATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        <Field label="부서">
          <select name="department" required defaultValue={employee?.department ?? ""} className={inputCls}>
            <option value="" disabled>
              선택하세요
            </option>
            {DEPARTMENT_OPTIONS.filter((opt) => opt !== "공지").map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        <Field label="직급">
          <input name="job_title" required defaultValue={employee?.job_title ?? ""} placeholder="예) 대리, 과장, 팀장" className={inputCls} />
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
          <input name="password" type="password" required={mode === "create"} minLength={4} className={inputCls} />
          <p className="mt-1 text-sm text-[#8A8270]">
            {mode === "create"
              ? "4자 이상 입력해주세요. 등록 후 본인에게 전달해주세요."
              : "비밀번호를 바꾸려면 4자 이상 입력하세요. 비워두면 기존 비밀번호가 유지됩니다."}
          </p>
        </Field>

        {state?.error && <p className="text-base text-red-600">{state.error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#0F5C56] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (mode === "create" ? "등록 중..." : "저장 중...") : mode === "create" ? "등록" : "저장"}
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
