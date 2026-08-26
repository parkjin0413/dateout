"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";

import type { CustomerFormState } from "@/app/customers/actions";
import type { Customer, CustomerCategory } from "@/lib/customers/types";

const inputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

type Props = {
  mode: "create" | "edit";
  action: (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;
  categories: CustomerCategory[];
  customer?: Customer;
  cardImageUrl?: string | null;
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-base font-medium text-[#4B4739]">{label}</label>
    {children}
  </div>
);

const CustomerForm = ({ mode, action, categories, customer, cardImageUrl }: Props) => {
  const [state, formAction, isPending] = useActionState(action, null);
  const listHref = customer ? `/customers/${customer.id}` : "/customers";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">{mode === "create" ? "고객 등록" : "고객 정보 수정"}</h1>
      </div>

      <form action={formAction} className="max-w-2xl space-y-5 rounded-2xl border border-[#E7E2D2] bg-white p-6">
        <Field label="구분">
          <select name="category" defaultValue={customer?.category ?? ""} required className={inputCls}>
            <option value="" disabled>
              선택하세요
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              등록된 구분이 없습니다.{" "}
              <Link href="/customers/categories" className="underline">
                구분 관리
              </Link>
              에서 먼저 추가해주세요.
            </p>
          )}
        </Field>

        <Field label="이름">
          <input name="name" defaultValue={customer?.name ?? ""} required className={inputCls} />
        </Field>

        <Field label="소속">
          <input name="company" defaultValue={customer?.company ?? ""} required placeholder="회사명" className={inputCls} />
        </Field>

        <Field label="연락처">
          <input name="phone" defaultValue={customer?.phone ?? ""} required placeholder="예) 01012345678" className={inputCls} />
        </Field>

        <Field label="이메일">
          <input name="email" type="email" defaultValue={customer?.email ?? ""} className={inputCls} />
        </Field>

        <Field label="메모">
          <textarea name="memo" defaultValue={customer?.memo ?? ""} rows={4} className={inputCls} />
        </Field>

        <Field label="명함 사진">
          {cardImageUrl && (
            <div className="mb-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- 비공개 버킷 서명 URL, next/image 원격 도메인 설정 불필요 */}
              <img src={cardImageUrl} alt="명함 사진" className="h-auto w-full rounded-lg border border-[#E7E2D2] sm:w-64" />
              <label className="flex items-center gap-1.5 text-sm text-[#6B6455]">
                <input type="checkbox" name="remove_card_image" />
                사진 삭제
              </label>
            </div>
          )}
          <input type="file" name="card_image" accept="image/jpeg,image/png,image/webp" className={inputCls} />
        </Field>

        {state?.error && <p className="text-base text-red-600">{state.error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#0F5C56] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "저장 중..." : mode === "create" ? "등록" : "수정하기"}
          </button>
          <Link href={listHref} className="text-base text-[#6B6455] transition-colors hover:text-[#211D14]">
            목록으로
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
