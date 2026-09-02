"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";

import type { LeaveFormState } from "@/app/forms/leave/actions";
import { EMPTY_LEAVE_BALANCE_ENTRY, LEAVE_DAY_OPTIONS, LEAVE_TYPES, type LeaveBalanceEntry } from "@/lib/leave/types";
import LeavePaper from "./leave-paper";
import { ApproverSelect, type Employee } from "./approver-select";

const inputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

const balanceInputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-2 py-2 text-center text-sm text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

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
    substituteJobTitle: string;
    substituteName: string;
    balanceAnnual: LeaveBalanceEntry;
    balanceSubstitute: LeaveBalanceEntry;
    approver1: string;
    approver2: string;
    approver3: string;
  };
};

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
  const [substituteJobTitle, setSubstituteJobTitle] = useState(initial?.substituteJobTitle ?? "");
  const [substituteName, setSubstituteName] = useState(initial?.substituteName ?? "");
  const [balanceAnnual, setBalanceAnnual] = useState<LeaveBalanceEntry>(initial?.balanceAnnual ?? EMPTY_LEAVE_BALANCE_ENTRY);
  const [balanceSubstitute, setBalanceSubstitute] = useState<LeaveBalanceEntry>(
    initial?.balanceSubstitute ?? EMPTY_LEAVE_BALANCE_ENTRY
  );
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
        <h1 className="text-3xl font-bold text-[#211D14]">{mode === "create" ? "휴가신청서 작성" : "휴가신청서 수정"}</h1>
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
              placeholder="특이사항이 없으면 '개인 사정'으로 적어주세요."
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">업무 대행자 직위 (선택)</label>
              <input
                type="text"
                name="substitute_job_title"
                value={substituteJobTitle}
                onChange={(e) => setSubstituteJobTitle(e.target.value)}
                placeholder="대행자 기입, 없을 시 x"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">업무 대행자 성명 (선택)</label>
              <input
                type="text"
                name="substitute_name"
                value={substituteName}
                onChange={(e) => setSubstituteName(e.target.value)}
                placeholder="대행자 기입, 없을 시 x"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-base font-medium text-[#4B4739]">연차/대체휴가 현황 (선택, 직접 입력)</label>
            <div className="overflow-x-auto rounded-xl border border-[#E7E2D2]">
              <table className="w-full min-w-[480px] text-center text-sm">
                <thead>
                  <tr className="bg-[#F5F3EA] text-[#4B4739]">
                    <th className="px-2 py-2 font-medium">구분</th>
                    <th className="px-2 py-2 font-medium">전체일수</th>
                    <th className="px-2 py-2 font-medium">전일까지 누계</th>
                    <th className="px-2 py-2 font-medium">사용일</th>
                    <th className="px-2 py-2 font-medium">잔여일</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="px-2 py-2 font-medium text-[#4B4739]">연차</th>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        name="balance_annual_total"
                        value={balanceAnnual.total}
                        onChange={(e) => setBalanceAnnual((p) => ({ ...p, total: e.target.value }))}
                        className={balanceInputCls}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        name="balance_annual_prior"
                        value={balanceAnnual.priorUsed}
                        onChange={(e) => setBalanceAnnual((p) => ({ ...p, priorUsed: e.target.value }))}
                        className={balanceInputCls}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        name="balance_annual_used"
                        value={balanceAnnual.used}
                        onChange={(e) => setBalanceAnnual((p) => ({ ...p, used: e.target.value }))}
                        className={balanceInputCls}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        name="balance_annual_remaining"
                        value={balanceAnnual.remaining}
                        onChange={(e) => setBalanceAnnual((p) => ({ ...p, remaining: e.target.value }))}
                        className={balanceInputCls}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="px-2 py-2 font-medium text-[#4B4739]">대체휴가</th>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        name="balance_substitute_total"
                        value={balanceSubstitute.total}
                        onChange={(e) => setBalanceSubstitute((p) => ({ ...p, total: e.target.value }))}
                        className={balanceInputCls}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        name="balance_substitute_prior"
                        value={balanceSubstitute.priorUsed}
                        onChange={(e) => setBalanceSubstitute((p) => ({ ...p, priorUsed: e.target.value }))}
                        className={balanceInputCls}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        name="balance_substitute_used"
                        value={balanceSubstitute.used}
                        onChange={(e) => setBalanceSubstitute((p) => ({ ...p, used: e.target.value }))}
                        className={balanceInputCls}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        name="balance_substitute_remaining"
                        value={balanceSubstitute.remaining}
                        onChange={(e) => setBalanceSubstitute((p) => ({ ...p, remaining: e.target.value }))}
                        className={balanceInputCls}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-base font-medium text-[#4B4739]">소속결재선</label>
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
            substituteJobTitle={substituteJobTitle}
            substituteName={substituteName}
            leaveBalance={{ annual: balanceAnnual, substitute: balanceSubstitute }}
            approvers={previewApprovers}
            stampUrl={stampUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default LeaveForm;
