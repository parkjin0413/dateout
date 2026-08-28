"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import type { MeetingFormState } from "@/app/forms/meeting/actions";
import MeetingPaper from "./meeting-paper";
import { ApproverSelect, type Employee } from "./approver-select";

const inputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

type Row = { category: string; content: string; note: string };

const emptyRow = (): Row => ({ category: "", content: "", note: "" });

type Props = {
  mode: "create" | "edit";
  action: (state: MeetingFormState, formData: FormData) => Promise<MeetingFormState>;
  drafterName: string;
  drafterJobTitle: string;
  department: string;
  draftedAt: string;
  employees: Employee[];
  stampUrl: string | null;
  cancelHref?: string;
  initial?: {
    siteName: string;
    meetingDate: string;
    location: string;
    counterpartName: string;
    counterpartOrg: string;
    items: Row[];
    photoTaken: boolean;
    drawingAttached: boolean;
    approver1: string;
    approver2: string;
    approver3: string;
  };
};

const MeetingForm = ({
  mode,
  action,
  drafterName,
  drafterJobTitle,
  department,
  draftedAt,
  employees,
  stampUrl,
  cancelHref = "/forms/meeting",
  initial,
}: Props) => {
  const [state, formAction, isPending] = useActionState(action, null);

  const [draftedAtValue, setDraftedAtValue] = useState(draftedAt);
  const [siteName, setSiteName] = useState(initial?.siteName ?? "");
  const [meetingDate, setMeetingDate] = useState(initial?.meetingDate ?? draftedAt);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [counterpartName, setCounterpartName] = useState(initial?.counterpartName ?? "");
  const [counterpartOrg, setCounterpartOrg] = useState(initial?.counterpartOrg ?? "");
  const [rows, setRows] = useState<Row[]>(initial?.items ?? [emptyRow()]);
  const [photoTaken, setPhotoTaken] = useState(initial?.photoTaken ?? false);
  const [drawingAttached, setDrawingAttached] = useState(initial?.drawingAttached ?? false);
  const [approver1, setApprover1] = useState(initial?.approver1 ?? "");
  const [approver2, setApprover2] = useState(initial?.approver2 ?? "");
  const [approver3, setApprover3] = useState(initial?.approver3 ?? "");

  const previewApprovers = [approver1, approver2, approver3]
    .filter(Boolean)
    .map((id, i) => {
      const emp = employees.find((e) => e.id === id);
      return { order: i + 1, name: emp?.name ?? "", jobTitle: emp?.job_title ?? "" };
    });

  const updateRow = (index: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">{mode === "create" ? "현장 협의록 작성" : "현장 협의록 수정"}</h1>
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
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">현장명</label>
              <input
                type="text"
                name="site_name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                placeholder="예: OOO 신축 현장"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">협의일자</label>
              <input
                type="date"
                name="meeting_date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-[#4B4739]">협의장소</label>
            <input
              type="text"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 지하 1층 기계실"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">협의 상대방 성명</label>
              <input
                type="text"
                name="counterpart_name"
                value={counterpartName}
                onChange={(e) => setCounterpartName(e.target.value)}
                required
                placeholder="예: 홍길동"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-base font-medium text-[#4B4739]">소속/직함</label>
              <input
                type="text"
                name="counterpart_org"
                value={counterpartOrg}
                onChange={(e) => setCounterpartOrg(e.target.value)}
                placeholder="예: OOO건설 현장소장"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-base font-medium text-[#4B4739]">협의 내용</label>
              <button
                type="button"
                onClick={() => setRows((prev) => [...prev, emptyRow()])}
                className="rounded-lg border border-[#E7E2D2] px-3 py-1.5 text-sm font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
              >
                + 항목 추가
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-[#E7E2D2] p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr_auto]">
                    <input
                      type="text"
                      name="item_category"
                      value={row.category}
                      onChange={(e) => updateRow(i, { category: e.target.value })}
                      placeholder="구분"
                      className={inputCls}
                    />
                    <input
                      type="text"
                      name="item_note"
                      value={row.note}
                      onChange={(e) => updateRow(i, { note: e.target.value })}
                      placeholder="비고"
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
                  <textarea
                    name="item_content"
                    value={row.content}
                    onChange={(e) => updateRow(i, { content: e.target.value })}
                    placeholder="협의 내용 (Enter로 줄바꿈 가능)"
                    required
                    rows={3}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-[#4B4739]">증빙 자료</label>
            <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-lg border border-[#E7E2D2] p-3">
              <label className="flex items-center gap-1.5 text-base text-[#211D14]">
                <input
                  type="checkbox"
                  name="photo_taken"
                  checked={photoTaken}
                  onChange={(e) => setPhotoTaken(e.target.checked)}
                />
                현장사진 촬영함
              </label>
              <label className="flex items-center gap-1.5 text-base text-[#211D14]">
                <input
                  type="checkbox"
                  name="drawing_attached"
                  checked={drawingAttached}
                  onChange={(e) => setDrawingAttached(e.target.checked)}
                />
                도면/스케치 첨부함
              </label>
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
          <MeetingPaper
            drafterName={drafterName}
            drafterJobTitle={drafterJobTitle}
            department={department}
            draftedAt={draftedAtValue}
            siteName={siteName}
            meetingDate={meetingDate}
            location={location}
            counterpartName={counterpartName}
            counterpartOrg={counterpartOrg}
            items={rows.filter((r) => r.content)}
            photoTaken={photoTaken}
            drawingAttached={drawingAttached}
            approvers={previewApprovers}
            stampUrl={stampUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default MeetingForm;
