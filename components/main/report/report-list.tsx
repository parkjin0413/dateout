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
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/90 shadow-lg shadow-black/40 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-black/[0.02] px-5 py-4">
              <div className="truncate text-base font-semibold text-gray-900">{report.title}</div>
              {canManage && (
                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/report/${userId}/${report.id}/edit`}
                    className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                  >
                    수정
                  </Link>
                  <DeleteReportButton
                    id={report.id}
                    userId={userId}
                    className="text-sm font-medium text-red-600 transition-colors hover:text-red-500 disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-5 px-5 py-5">
              <div>
                <div className="mb-1.5 text-sm font-semibold text-purple-700">금일 업무</div>
                <div className="whitespace-pre-wrap text-base text-gray-800">{report.today_work || "-"}</div>
              </div>
              <div>
                <div className="mb-1.5 text-sm font-semibold text-blue-700">명일 업무</div>
                <div className="whitespace-pre-wrap text-base text-gray-800">{report.tomorrow_work || "-"}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportList;
