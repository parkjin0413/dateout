export type PaperApprover = { order: number; name: string; jobTitle: string };

export type LeavePaperProps = {
  docNumber?: string;
  drafterName: string;
  drafterJobTitle?: string;
  department: string;
  draftedAt: string;
  startDate: string;
  endDate: string;
  days: number | string;
  leaveType: string;
  reason: string;
  approvers: PaperApprover[];
  stampUrl?: string | null;
};

const ApprovalBox = ({ label, name, jobTitle, stampUrl }: { label: string; name: string; jobTitle: string; stampUrl?: string | null }) => (
  <div className="flex w-20 flex-col text-center sm:w-24">
    <div className="border border-[#211D14] bg-[#F5F3EA] py-1 text-[10px] font-medium text-[#4B4739] sm:text-xs">{label}</div>
    <div className="relative flex h-14 items-center justify-center border border-t-0 border-[#211D14] bg-white sm:h-16">
      {stampUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- 비공개 버킷 서명 URL
        <img src={stampUrl} alt="도장" className="absolute h-12 w-12 object-contain opacity-90 sm:h-14 sm:w-14" />
      )}
      <span className="relative text-xs font-normal text-[#211D14]/15 sm:text-sm">{name || " "}</span>
    </div>
    <div className="border border-t-0 border-[#211D14] bg-white py-0.5 text-[9px] text-[#8A8270]">{jobTitle || " "}</div>
  </div>
);

const LeavePaper = ({
  docNumber,
  drafterName,
  drafterJobTitle,
  department,
  draftedAt,
  startDate,
  endDate,
  days,
  leaveType,
  reason,
  approvers,
  stampUrl,
}: LeavePaperProps) => {
  return (
    <div className="print-sheet mx-auto w-full max-w-3xl border border-[#E7E2D2] bg-white p-6 text-[#211D14] sm:p-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- 인쇄 캡처 안정성을 위해 next/image 대신 일반 img 사용 */}
            <img src="/logo2.png" alt="강산이엔지" className="h-7 w-7" />
            <span className="text-sm font-bold tracking-tight">강산이엔지</span>
          </div>
          <h1 className="text-xl font-bold tracking-widest sm:text-2xl">연 차 신 청 서</h1>
          {docNumber && <p className="mt-1 text-sm text-[#8A8270]">문서번호 {docNumber}</p>}
        </div>
        <div className="flex shrink-0">
          <ApprovalBox label="담당" name={drafterName} jobTitle={drafterJobTitle ?? ""} stampUrl={stampUrl} />
          {approvers.map((a, i) => {
            const isFinal = i === approvers.length - 1;
            return <ApprovalBox key={a.order} label={isFinal ? "최종 결재" : `${i + 1}차 결재`} name={a.name} jobTitle={a.jobTitle} />;
          })}
        </div>
      </div>

      <table className="w-full border-collapse text-xs sm:text-sm">
        <tbody>
          <tr>
            <th className="w-24 border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium sm:w-28">기안자</th>
            <td className="border border-[#211D14] px-3 py-3">{drafterName}</td>
            <th className="w-24 border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium sm:w-28">부서</th>
            <td className="border border-[#211D14] px-3 py-3">{department || "-"}</td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium">기안일</th>
            <td colSpan={3} className="border border-[#211D14] px-3 py-3">
              {draftedAt}
            </td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium">휴가기간</th>
            <td colSpan={3} className="border border-[#211D14] px-3 py-3">
              {startDate || "-"} ~ {endDate || "-"}
            </td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium">휴가종류</th>
            <td colSpan={3} className="border border-[#211D14] px-3 py-3">
              {leaveType || "-"}
            </td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium">신청일수</th>
            <td colSpan={3} className="border border-[#211D14] px-3 py-3">
              {days ? `${days}일` : "-"}
            </td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left align-top font-medium">휴가사유</th>
            <td colSpan={3} className="whitespace-pre-wrap border border-[#211D14] px-3 py-3 align-top">
              <div className="min-h-[320px]">{reason || "-"}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LeavePaper;
