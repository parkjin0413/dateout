"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";

import type { LeaveFormState } from "@/app/forms/leave/actions";
import { LEAVE_DAY_OPTIONS, LEAVE_TYPES } from "@/lib/leave/types";
import LeavePaper from "./leave-paper";

const inputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

type Employee = { id: string; name: string | null; department: string; job_title: string };

type Props = {
  mode: "create" | "edit";
  action: (state: LeaveFormState, formData: FormData) => Promise<LeaveFormState>;
  drafterName: string;
  drafterJobTitle: string;
  department: string;
  draftedAt: string;
  employees: Employee[];
  stampUrl: string | null;
  cancelHref?: string;
  initial?: {
    startDate: string;
    endDate: string;
    days: string;
    leaveType: string;
    reason: string;
    approver1: string;
    approver2: string;
    approver3: string;
  };
};

const ApproverSelect = ({
  label,
  required,
  value,
  onChange,
  employees,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  employees: Employee[];
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-[#4B4739]">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className={inputCls}>
      <option value="">{required ? "선택" : "선택 안 함"}</option>
      {employees.map((e) => (
        <option key={e.id} value={e.id}>
          {e.name} {e.job_title ? `(${e.job_title})` : ""}
        </option>
      ))}
    </select>
  </div>
);

const LeaveForm = ({
  mode,
  action,
  drafterName,
  drafterJobTitle,
  department,
  draftedAt,
  employees,
  stampUrl,
  cancelHref = "/forms/leave",
  initial,
}: Props) => {
  const [state, formAction, isPending] = useActionState(action, null);

  const [draftedAtValue, setDraftedAtValue] = useState(draftedAt);
  const [startDate, setStartDate] = useState(initial?.startDate ?? draftedAt);
  const [endDate, setEndDate] = useState(initial?.endDate ?? draftedAt);
  const [days, setDays] = useState(initial?.days ?? "");
  const [leaveType, setLeaveType] = useState(initial?.leaveType ?? "");
  const [reason, setReason] = useState(initial?.reason ?? "");
  const [approver1, setApprover1] = useState(initial?.approver1 ?? "");
  const [approver2, setApprover2] = useState(initial?.approver2 ?? "");
  const [approver3, setApprover3] = useState(initial?.approver3 ?? "");

  const previewApprovers = useMemo(() => {
    const ids = [approver1, approver2, approver3].filter(Boolean);
    return ids.map((id, i) => {
      const emp = employees.find((e) => e.id === id);
      return { order: i + 1, name: emp?.name ?? "", jobTitle: emp?.job_title ?? "" };
    });
  }, [approver1, approver2, approver3, employees]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">{mode === "create" ? "연차신청서 작성" : "연차신청서 수정"}</h1>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">휴가기간 (시작일)</label>
              <input
                type="date"
                name="start_date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">휴가기간 (종료일)</label>
              <input
                type="date"
                name="end_date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">신청일수</label>
              <select name="days" value={days} onChange={(e) => setDays(e.target.value)} required className={inputCls}>
                <option value="" disabled>
                  선택
                </option>
                {LEAVE_DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}일
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">휴가종류</label>
              <select name="leave_type" value={leaveType} onChange={(e) => setLeaveType(e.target.value)} required className={inputCls}>
                <option value="" disabled>
                  선택
                </option>
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-[#4B4739]">휴가사유</label>
            <textarea
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              placeholder="휴가 사유를 적어주세요."
              className={inputCls}
            />
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
          <LeavePaper
            drafterName={drafterName}
            drafterJobTitle={drafterJobTitle}
            department={department}
            draftedAt={draftedAtValue}
            startDate={startDate}
            endDate={endDate}
            days={days}
            leaveType={leaveType}
            reason={reason}
            approvers={previewApprovers}
            stampUrl={stampUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default LeaveForm;
