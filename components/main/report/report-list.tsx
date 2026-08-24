import Link from "next/link";

import type { WorkReport } from "@/lib/report/types";
import DeleteReportButton from "./delete-report-button";

type Props = {
  userId: string;
  reports: WorkReport[];
  viewerId: string;
  isAdmin: boolean;
};

const ReportList = ({ userId, reports, viewerId, isAdmin }: Props) => {
  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E7E2D2] bg-white px-4 py-12 text-center text-base text-[#8A8270]">
        작성된 업무보고가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {reports.map((report) => {
        const canManage = isAdmin || report.user_id === viewerId;
        return (
          <div
            key={report.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#E7E2D2] bg-white"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#E7E2D2] bg-[#FAF8F0] px-5 py-4">
              <div className="truncate text-base font-semibold text-[#211D14]">{report.title}</div>
              {canManage && (
                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/report/${userId}/${report.id}/edit`}
                    className="text-sm font-medium text-[#6B6455] transition-colors hover:text-[#211D14]"
                  >
                    수정
                  </Link>
                  <DeleteReportButton
                    id={report.id}
                    userId={userId}
                    className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-5 px-5 py-5">
              <div>
                <div className="mb-1.5 text-sm font-semibold text-[#0F5C56]">금일 업무</div>
                <div className="whitespace-pre-wrap text-base text-[#4B4739]">{report.today_work || "-"}</div>
              </div>
              <div>
                <div className="mb-1.5 text-sm font-semibold text-blue-700">명일 업무</div>
                <div className="whitespace-pre-wrap text-base text-[#4B4739]">{report.tomorrow_work || "-"}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportList;
