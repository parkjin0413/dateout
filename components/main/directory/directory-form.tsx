"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";

import type { DirectoryFormState } from "@/app/directory/actions";
import { DEPARTMENT_OPTIONS } from "@/lib/directory/dept";
import type { Employee } from "@/lib/directory/types";

const inputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

type Props = {
  mode: "create" | "edit";
  action: (state: DirectoryFormState, formData: FormData) => Promise<DirectoryFormState>;
  employee?: Employee;
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-base font-medium text-[#4B4739]">{label}</label>
    {children}
  </div>
);

const DirectoryForm = ({ mode, action, employee }: Props) => {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">{mode === "create" ? "직원 추가" : "직원 정보 수정"}</h1>
        <p className="mt-1 text-base text-[#6B6455]">직원명부에 표시될 정보를 입력하세요.</p>
      </div>

      <form action={formAction} className="max-w-lg space-y-5 rounded-2xl border border-[#E7E2D2] bg-white p-6">
        <Field label="부서">
          <input
            name="department"
            list="department-options"
            defaultValue={employee?.department ?? ""}
            placeholder="예) 영업부, 경영진"
            required
            className={inputCls}
          />
          <datalist id="department-options">
            {DEPARTMENT_OPTIONS.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
          <p className="mt-1 text-sm text-[#8A8270]">
            목록에 없는 부서(예: 대표이사 등)는 직접 입력하세요.
          </p>
        </Field>

        <Field label="직급">
          <input
            name="job_title"
            defaultValue={employee?.job_title ?? ""}
            placeholder="예) 대리, 과장, 팀장"
            required
            className={inputCls}
          />
        </Field>

        <Field label="이름">
          <input name="name" defaultValue={employee?.name ?? ""} required className={inputCls} />
        </Field>

        <Field label="연락처">
          <input
            name="phone"
            defaultValue={employee?.phone ?? ""}
            placeholder="예) 01012345678"
            required
            className={inputCls}
          />
          <p className="mt-1 text-sm text-[#8A8270]">숫자만 입력해도 저장 시 자동으로 하이픈(-)이 붙습니다.</p>
        </Field>

        <Field label="직통번호">
          <input
            name="direct_line"
            defaultValue={employee?.direct_line ?? ""}
            placeholder="예) 0212345678 (선택)"
            className={inputCls}
          />
        </Field>

        {state?.error && <p className="text-base text-red-600">{state.error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#0F5C56] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "저장 중..." : mode === "create" ? "추가하기" : "수정하기"}
          </button>
          <Link href="/directory" className="text-base text-[#6B6455] transition-colors hover:text-[#211D14]">
            목록으로
          </Link>
        </div>
      </form>
    </div>
  );
};

export default DirectoryForm;
