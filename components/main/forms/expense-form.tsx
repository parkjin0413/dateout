"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";

import type { ExpenseFormState } from "@/app/forms/expense/actions";
import { ATTACHMENT_TYPES, PAYMENT_METHODS } from "@/lib/expense/types";
import ExpensePaper from "./expense-paper";
import { ApproverSelect, type Employee } from "./approver-select";

const inputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

type Row = { date: string; description: string; vendor: string; amount: string };

const emptyRow = (date: string): Row => ({ date, description: "", vendor: "", amount: "" });

const formatAmount = (value: string) => {
  if (!value) return "";
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString("ko-KR") : value;
};

type Props = {
  mode: "create" | "edit";
  action: (state: ExpenseFormState, formData: FormData) => Promise<ExpenseFormState>;
  drafterName: string;
  drafterJobTitle: string;
  department: string;
  draftedAt: string;
  employees: Employee[];
  stampUrl: string | null;
  cancelHref?: string;
  initial?: {
    title: string;
    content: string;
    items: Row[];
    paymentMethod: string;
    vendorBasis: string;
    approver1: string;
    approver2: string;
    approver3: string;
    attachmentTypes: string[];
    attachmentOther: string;
  };
};

const ExpenseForm = ({
  mode,
  action,
  drafterName,
  drafterJobTitle,
  department,
  draftedAt,
  employees,
  stampUrl,
  cancelHref = "/forms/expense",
  initial,
}: Props) => {
  const [state, formAction, isPending] = useActionState(action, null);

  const [draftedAtValue, setDraftedAtValue] = useState(draftedAt);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [rows, setRows] = useState<Row[]>(initial?.items ?? [emptyRow(draftedAt)]);
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod ?? "");
  const [vendorBasis, setVendorBasis] = useState(initial?.vendorBasis ?? "");
  const [attachmentTypes, setAttachmentTypes] = useState<string[]>(initial?.attachmentTypes ?? []);
  const [attachmentOther, setAttachmentOther] = useState(initial?.attachmentOther ?? "");
  const [approver1, setApprover1] = useState(initial?.approver1 ?? "");
  const [approver2, setApprover2] = useState(initial?.approver2 ?? "");
  const [approver3, setApprover3] = useState(initial?.approver3 ?? "");

  const total = useMemo(() => rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0), [rows]);

  const previewApprovers = useMemo(() => {
    const ids = [approver1, approver2, approver3].filter(Boolean);
    return ids.map((id, i) => {
      const emp = employees.find((e) => e.id === id);
      return { order: i + 1, name: emp?.name ?? "", jobTitle: emp?.job_title ?? "" };
    });
  }, [approver1, approver2, approver3, employees]);

  const updateRow = (index: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const toggleAttachmentType = (type: string) => {
    setAttachmentTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">{mode === "create" ? "지출결의서 작성" : "지출결의서 수정"}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <form action={formAction} className="space-y-6 rounded-2xl border border-[#E7E2D2] bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">기안자</label>
              <div className={`${inputCls} bg-[#F5F3EA] text-[#6B6455]`}>{drafterName}</div>
            </div>
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">부서</label>
              <div className={`${inputCls} bg-[#F5F3EA] text-[#6B6455]`}>{department || "-"}</div>
            </div>
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">기안일</label>
              <input
                type="date"
                name="drafted_at"
                value={draftedAtValue}
                onChange={(e) => setDraftedAtValue(e.target.value)}
                required
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-[#4B4739]">제목</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="예: OOO 구매 비용 지출 건"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-[#4B4739]">내용</label>
            <textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
              placeholder="이 지출결의서를 올리는 이유를 적어주세요."
              className={inputCls}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-base font-medium text-[#4B4739]">지출 항목</label>
              <button
                type="button"
                onClick={() => setRows((prev) => [...prev, emptyRow(draftedAtValue)])}
                className="rounded-lg border border-[#E7E2D2] px-3 py-1.5 text-sm font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
              >
                + 항목 추가
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-[#E7E2D2] p-3 sm:grid-cols-[140px_1fr_1fr_140px_auto]">
                  <input
                    type="date"
                    name="item_date"
                    value={row.date}
                    onChange={(e) => updateRow(i, { date: e.target.value })}
                    required
                    className={inputCls}
                  />
                  <input
                    type="text"
                    name="item_description"
                    value={row.description}
                    onChange={(e) => updateRow(i, { description: e.target.value })}
                    placeholder="품목"
                    required
                    className={inputCls}
                  />
                  <input
                    type="text"
                    name="item_vendor"
                    value={row.vendor}
                    onChange={(e) => updateRow(i, { vendor: e.target.value })}
                    placeholder="거래처"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="item_amount"
                    value={formatAmount(row.amount)}
                    onChange={(e) => updateRow(i, { amount: e.target.value.replace(/[^0-9]/g, "") })}
                    placeholder="금액"
                    required
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))}
                    disabled={rows.length === 1}
                    className="rounded-lg border border-[#E7E2D2] px-3 py-2.5 text-sm text-[#8A8270] transition-colors hover:bg-[#F5F3EA] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-end gap-2 text-lg font-bold text-[#211D14]">
              합계 {total.toLocaleString("ko-KR")}원
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-[#4B4739]">결제방법</label>
            <select
              name="payment_method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              className={inputCls}
            >
              <option value="" disabled>
                선택
              </option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-[#4B4739]">선정 기준</label>
            <textarea
              name="vendor_basis"
              value={vendorBasis}
              onChange={(e) => setVendorBasis(e.target.value)}
              rows={3}
              required
              placeholder="거래처/견적 선정 근거 (예: 최저가 3사 비교, 기존 거래처 등)"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-[#4B4739]">증빙 첨부 (선택)</label>
            <p className="mb-2 text-sm text-[#8A8270]">파일을 올리지 않고, 인쇄 후 뒷면에 붙일 서류의 종류만 체크합니다. 여러 개를 함께 체크할 수 있습니다.</p>

            <div className="rounded-lg border border-[#E7E2D2] p-3">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {ATTACHMENT_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-1.5 text-base text-[#211D14]">
                    <input
                      type="checkbox"
                      name="attachment_types"
                      value={t}
                      checked={attachmentTypes.includes(t)}
                      onChange={() => toggleAttachmentType(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <label className="shrink-0 text-base text-[#4B4739]">기타</label>
                <input
                  type="text"
                  name="attachment_other"
                  value={attachmentOther}
                  onChange={(e) => setAttachmentOther(e.target.value)}
                  placeholder="직접 입력"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-base font-medium text-[#4B4739]">결재선</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ApproverSelect label="1차 결재자" employees={employees} value={approver1} onChange={setApprover1} required />
              <ApproverSelect label="2차 결재자 (선택)" employees={employees} value={approver2} onChange={setApprover2} />
              <ApproverSelect label="3차 결재자 (선택)" employees={employees} value={approver3} onChange={setApprover3} />
            </div>
            {/* select 태그가 name 없이 렌더링되므로 실제 제출용 hidden input을 별도로 둔다 */}
            <input type="hidden" name="approver_1" value={approver1} />
            <input type="hidden" name="approver_2" value={approver2} />
            <input type="hidden" name="approver_3" value={approver3} />
          </div>

          {state?.error && <p className="text-base text-red-600">{state.error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#0F5C56] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "저장 중..." : mode === "create" ? "작성 완료" : "수정하기"}
            </button>
            <Link href={cancelHref} className="text-base text-[#6B6455] transition-colors hover:text-[#211D14]">
              취소
            </Link>
          </div>
        </form>

        <div className="lg:sticky lg:top-6">
          <p className="mb-2 text-sm font-medium text-[#8A8270]">미리보기</p>
          <ExpensePaper
            drafterName={drafterName}
            drafterJobTitle={drafterJobTitle}
            department={department}
            draftedAt={draftedAtValue}
            title={title}
            content={content}
            items={rows
              .filter((r) => r.description || r.amount)
              .map((r) => ({ date: r.date, description: r.description, vendor: r.vendor, amount: Number(r.amount) || 0 }))}
            totalAmount={total}
            paymentMethod={paymentMethod}
            vendorBasis={vendorBasis}
            approvers={previewApprovers}
            attachmentTypes={attachmentTypes}
            attachmentOther={attachmentOther}
            stampUrl={stampUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
