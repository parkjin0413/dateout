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
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-12 text-center text-base text-gray-500">
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
            className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/20"
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.05] px-5 py-4">
              <div className="truncate text-base font-semibold text-white">{report.title}</div>
              {canManage && (
                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/report/${userId}/${report.id}/edit`}
                    className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
                  >
                    수정
                  </Link>
                  <DeleteReportButton
                    id={report.id}
                    userId={userId}
                    className="text-sm font-medium text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-5 px-5 py-5">
              <div>
                <div className="mb-1.5 text-sm font-semibold text-purple-300">금일 업무</div>
                <div className="whitespace-pre-wrap text-base text-gray-200">{report.today_work || "-"}</div>
              </div>
              <div>
                <div className="mb-1.5 text-sm font-semibold text-blue-300">명일 업무</div>
                <div className="whitespace-pre-wrap text-base text-gray-200">{report.tomorrow_work || "-"}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportList;
