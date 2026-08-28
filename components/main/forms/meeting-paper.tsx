export type PaperApprover = { order: number; name: string; jobTitle: string };
export type PaperMeetingItem = { category: string; content: string; note: string };

export type MeetingPaperProps = {
  docNumber?: string;
  drafterName: string;
  drafterJobTitle?: string;
  department: string;
  draftedAt: string;
  siteName: string;
  meetingDate: string;
  location: string;
  counterpartName: string;
  counterpartOrg: string;
  items: PaperMeetingItem[];
  photoTaken: boolean;
  drawingAttached: boolean;
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

const MeetingPaper = ({
  docNumber,
  drafterName,
  drafterJobTitle,
  department,
  draftedAt,
  siteName,
  meetingDate,
  location,
  counterpartName,
  counterpartOrg,
  items,
  photoTaken,
  drawingAttached,
  approvers,
  stampUrl,
}: MeetingPaperProps) => {
  return (
    <div className="print-sheet mx-auto w-full max-w-3xl border border-[#E7E2D2] bg-white p-6 text-[#211D14] sm:p-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- 인쇄 캡처 안정성을 위해 next/image 대신 일반 img 사용 */}
            <img src="/logo2.png" alt="강산이엔지" className="h-7 w-7" />
            <span className="text-sm font-bold tracking-tight">강산이엔지</span>
          </div>
          <h1 className="text-xl font-bold tracking-widest sm:text-2xl">현 장 협 의 록</h1>
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

      <table className="mb-6 w-full border-collapse text-xs sm:text-sm">
        <tbody>
          <tr>
            <th className="w-24 border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium sm:w-28">기안자</th>
            <td className="border border-[#211D14] px-3 py-3">{drafterName}</td>
            <th className="w-24 border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium sm:w-28">부서</th>
            <td className="border border-[#211D14] px-3 py-3">{department || "-"}</td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium">기안일</th>
            <td className="border border-[#211D14] px-3 py-3">{draftedAt}</td>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium">협의일자</th>
            <td className="border border-[#211D14] px-3 py-3">{meetingDate}</td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium">현장명</th>
            <td className="border border-[#211D14] px-3 py-3">{siteName || "-"}</td>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium">협의장소</th>
            <td className="border border-[#211D14] px-3 py-3">{location || "-"}</td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium">협의 상대방</th>
            <td className="border border-[#211D14] px-3 py-3">{counterpartName || "-"}</td>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-3 text-left font-medium">소속/직함</th>
            <td className="border border-[#211D14] px-3 py-3">{counterpartOrg || "-"}</td>
          </tr>
        </tbody>
      </table>

      <table className="mb-8 w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-[#F5F3EA]">
            <th className="w-24 border border-[#211D14] px-3 py-2 sm:w-28">구분</th>
            <th className="border border-[#211D14] px-3 py-2">협의 내용</th>
            <th className="w-32 border border-[#211D14] px-3 py-2 sm:w-40">비고</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={3} className="border border-[#211D14] px-3 py-6 text-center text-[#8A8270]">
                <div className="min-h-[240px]">협의 내용을 입력해주세요.</div>
              </td>
            </tr>
          ) : (
            items.map((item, i) => (
              <tr key={i}>
                <td className="border border-[#211D14] px-3 py-4 text-center align-top">{item.category || "-"}</td>
                <td className="whitespace-pre-wrap border border-[#211D14] px-3 py-4 align-top">
                  <div className="min-h-[70px]">{item.content}</div>
                </td>
                <td className="whitespace-pre-wrap border border-[#211D14] px-3 py-4 align-top">{item.note || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div>
        <div className="mb-1 text-xs font-medium text-[#4B4739] sm:text-sm">증빙 자료</div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-lg border border-[#E7E2D2] p-3 text-xs sm:text-sm">
          <span className="whitespace-nowrap">{photoTaken ? "☑" : "☐"} 현장사진 촬영함</span>
          <span className="whitespace-nowrap">{drawingAttached ? "☑" : "☐"} 도면/스케치 첨부함</span>
        </div>
      </div>
    </div>
  );
};

export default MeetingPaper;
