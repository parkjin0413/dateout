export type PaperApprover = { order: number; name: string; jobTitle: string };

export type ExpensePaperProps = {
  docNumber?: string;
  drafterName: string;
  drafterJobTitle?: string;
  department: string;
  draftedAt: string;
  title: string;
  content: string;
  items: { date: string; description: string; vendor: string; amount: number }[];
  totalAmount: number;
  paymentMethod: string;
  vendorBasis: string;
  approvers: PaperApprover[];
  attachmentTypes: string[];
  attachmentOther: string;
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

const ExpensePaper = ({
  docNumber,
  drafterName,
  drafterJobTitle,
  department,
  draftedAt,
  title,
  content,
  items,
  totalAmount,
  paymentMethod,
  vendorBasis,
  approvers,
  attachmentTypes,
  attachmentOther,
  stampUrl,
}: ExpensePaperProps) => {
  return (
    <div className="print-sheet mx-auto w-full max-w-3xl border border-[#E7E2D2] bg-white p-6 text-[#211D14] sm:p-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- 인쇄 캡처 안정성을 위해 next/image 대신 일반 img 사용 */}
            <img src="/logo2.png" alt="강산이엔지" className="h-7 w-7" />
            <span className="text-sm font-bold tracking-tight">강산이엔지</span>
          </div>
          <h1 className="text-xl font-bold tracking-widest sm:text-2xl">지 출 결 의 서</h1>
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
            <th className="w-20 border border-[#211D14] bg-[#F5F3EA] px-3 py-2 text-left font-medium sm:w-24">기안자</th>
            <td className="border border-[#211D14] px-3 py-2">{drafterName}</td>
            <th className="w-20 border border-[#211D14] bg-[#F5F3EA] px-3 py-2 text-left font-medium sm:w-24">부서</th>
            <td className="border border-[#211D14] px-3 py-2">{department || "-"}</td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-2 text-left font-medium">기안일</th>
            <td className="border border-[#211D14] px-3 py-2">{draftedAt}</td>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-2 text-left font-medium">결제방법</th>
            <td className="border border-[#211D14] px-3 py-2">{paymentMethod || "-"}</td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-2 text-left font-medium">제목</th>
            <td colSpan={3} className="border border-[#211D14] px-3 py-2">
              {title || "-"}
            </td>
          </tr>
          <tr>
            <th className="border border-[#211D14] bg-[#F5F3EA] px-3 py-2 text-left align-top font-medium">내용</th>
            <td colSpan={3} className="whitespace-pre-wrap border border-[#211D14] px-3 py-2 align-top">
              <div className="min-h-[120px]">{content || "-"}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="mb-2 w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-[#F5F3EA]">
            <th className="border border-[#211D14] px-3 py-2">일자</th>
            <th className="border border-[#211D14] px-3 py-2">품목</th>
            <th className="border border-[#211D14] px-3 py-2">거래처</th>
            <th className="border border-[#211D14] px-3 py-2">금액</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="border border-[#211D14] px-3 py-4 text-center text-[#8A8270]">
                지출 항목을 입력해주세요.
              </td>
            </tr>
          ) : (
            items.map((item, i) => (
              <tr key={i}>
                <td className="border border-[#211D14] px-3 py-2 text-center">{item.date}</td>
                <td className="border border-[#211D14] px-3 py-2">{item.description}</td>
                <td className="border border-[#211D14] px-3 py-2">{item.vendor || "-"}</td>
                <td className="border border-[#211D14] px-3 py-2 text-right">{item.amount.toLocaleString("ko-KR")}</td>
              </tr>
            ))
          )}
          <tr className="bg-[#F5F3EA] font-bold">
            <td colSpan={3} className="border border-[#211D14] px-3 py-2 text-right">
              합계
            </td>
            <td className="border border-[#211D14] px-3 py-2 text-right">{totalAmount.toLocaleString("ko-KR")}원</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-6 mt-8">
        <div className="mb-1 text-xs font-medium text-[#4B4739] sm:text-sm">선정 기준</div>
        <p className="whitespace-pre-wrap rounded-lg border border-[#E7E2D2] p-3 text-xs sm:text-sm">{vendorBasis || "-"}</p>
      </div>

      {(attachmentTypes.length > 0 || attachmentOther) && (
        <div>
          <div className="mb-1 text-xs font-medium text-[#4B4739] sm:text-sm">증빙 첨부 (인쇄 후 뒷면에 별도 첨부)</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-lg border border-[#E7E2D2] p-3 text-xs sm:text-sm">
            {attachmentTypes.map((t) => (
              <span key={t} className="whitespace-nowrap">
                ☑ {t}
              </span>
            ))}
            {attachmentOther && <span className="whitespace-nowrap">☑ {attachmentOther}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensePaper;
