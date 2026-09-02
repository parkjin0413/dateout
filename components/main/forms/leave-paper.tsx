import { ApprovalBoxTop, type PaperApprover } from "./approval-box";
import type { LeaveBalance } from "@/lib/leave/types";

export type { PaperApprover };

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
  substituteJobTitle: string;
  substituteName: string;
  leaveBalance: LeaveBalance;
  approvers: PaperApprover[];
  stampUrl?: string | null;
};

const th = "border border-[#211D14] bg-[#F5F3EA] px-3 py-2 text-center font-medium";
const td = "border border-[#211D14] px-3 py-2 text-center";

const SideLabel = ({ lines }: { lines: string[] }) => (
  <div className="flex w-9 flex-col items-center justify-center gap-1 border border-[#211D14] px-1 text-xs font-medium sm:w-10 sm:text-sm">
    {lines.map((line) => (
      <span key={line}>{line}</span>
    ))}
  </div>
);

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

const formatKoreanDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value || "-";
  const weekday = WEEKDAY_KO[new Date(y, m - 1, d).getDay()];
  return `${y}년 ${m}월 ${d}일(${weekday})`;
};

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
  substituteJobTitle,
  substituteName,
  leaveBalance,
  approvers,
  stampUrl,
}: LeavePaperProps) => {
  return (
    <div className="print-sheet mx-auto w-full max-w-3xl border border-[#E7E2D2] bg-white p-6 text-[#211D14] sm:p-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex flex-1 justify-center overflow-hidden">
          <h1 className="whitespace-nowrap text-xl font-bold tracking-widest sm:text-2xl">■휴가 □교육 신청서</h1>
        </div>
        <div className="flex shrink-0 items-stretch">
          <SideLabel lines={["결", "재"]} />
          <ApprovalBoxTop label="담당" name="" />
          <ApprovalBoxTop label="부장" name="" />
          <ApprovalBoxTop label="부서장" name="" />
          <ApprovalBoxTop label="대표이사" name="" />
        </div>
      </div>

      {docNumber && <p className="mb-2 text-sm text-[#8A8270]">문서번호 {docNumber}</p>}

      <table className="mb-6 w-full border-collapse text-xs sm:text-sm">
        <tbody>
          <tr>
            <th className={th}>소속부서</th>
            <td className={td}>{department || "-"}</td>
            <th className={th}>직 위</th>
            <td className={td}>{drafterJobTitle || "-"}</td>
            <th className={th}>성 명</th>
            <td className={td}>{drafterName} (인)</td>
          </tr>
          <tr>
            <th className={th}>일 시</th>
            <td colSpan={3} className={td}>
              <div>{formatKoreanDate(startDate)} 부터</div>
              <div>{formatKoreanDate(endDate)} 까지</div>
            </td>
            <th className={th}>기 간</th>
            <td className={td}>{days ? `${days}일` : "-"}</td>
          </tr>
          <tr>
            <th className={th}>사 유</th>
            <td colSpan={5} className={`whitespace-pre-wrap ${td}`}>
              {reason || "-"}
            </td>
          </tr>
          <tr>
            <th className={th}>업무 대행자</th>
            <td colSpan={5} className={td}>
              직위 : {substituteJobTitle || "x"} &nbsp;&nbsp; 성명 : {substituteName || "x"}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="mb-6 w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr>
            <th className={th}>구 분</th>
            <th className={th}>전체일수</th>
            <th className={th}>전일까지 누계</th>
            <th className={th}>사용일</th>
            <th className={th}>잔여일</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={th}>연차</th>
            <td className={td}>{leaveBalance.annual.total || " "}</td>
            <td className={td}>{leaveBalance.annual.priorUsed || " "}</td>
            <td className={td}>{leaveBalance.annual.used || " "}</td>
            <td className={td}>{leaveBalance.annual.remaining || " "}</td>
          </tr>
          <tr>
            <th className={th}>대체휴가</th>
            <td className={td}>{leaveBalance.substitute.total || " "}</td>
            <td className={td}>{leaveBalance.substitute.priorUsed || " "}</td>
            <td className={td}>{leaveBalance.substitute.used || " "}</td>
            <td className={td}>{leaveBalance.substitute.remaining || " "}</td>
          </tr>
        </tbody>
      </table>

      <p className="my-16 text-center text-xs sm:my-24 sm:text-sm">
        위와 같이 휴가({leaveType || "-"})를 신청하오니 결재하여 주시기 바랍니다.
      </p>
      <p className="mb-10 text-center text-xs sm:mb-14 sm:text-sm">{formatKoreanDate(draftedAt)}</p>

      <div className="mb-4 flex items-stretch">
        <SideLabel lines={["소속", "결재"]} />
        <ApprovalBoxTop label="담당" name={drafterName} stampUrl={stampUrl} />
        {approvers.map((a) => (
          <ApprovalBoxTop key={a.order} label={a.jobTitle} name={a.name} />
        ))}
      </div>

      <p className="mb-6 text-right text-xs text-[#6B6455] sm:text-sm">* 휴가 3일전 제출해주시기 바랍니다.</p>

      <div className="flex items-center justify-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- 인쇄 캡처 안정성을 위해 next/image 대신 일반 img 사용 */}
        <img src="/logo2.png" alt="강산이엔지" className="h-7 w-7 shrink-0" />
        <span className="whitespace-nowrap text-sm font-bold tracking-tight">주식회사 강산이엔지</span>
      </div>
    </div>
  );
};

export default LeavePaper;
