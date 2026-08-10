import Link from "next/link";

import type { FieldTrip } from "@/lib/field-trip/types";
import DeptBadge from "./dept-badge";
import DeleteTripButton from "./delete-trip-button";

type Props = {
  rows: FieldTrip[];
  viewerId: string;
  isAdmin: boolean;
  date: string;
  ym: string;
};

const periodText = (row: FieldTrip) =>
  row.trip_start === row.trip_end ? row.trip_start : `${row.trip_start} ~ ${row.trip_end}`;

const remarkLines = (row: FieldTrip) =>
  [row.remark_1, row.remark_2, row.remark_3, row.remark_4].filter((v) => v.trim() !== "");

const ScheduleTable = ({ rows, viewerId, isAdmin, date, ym }: Props) => {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] md:block">
      <table className="w-full min-w-[960px] text-base">
        <thead>
          <tr className="border-b border-white/10 text-left text-sm text-gray-400">
            <th className="px-4 py-4 font-medium">부서</th>
            <th className="px-4 py-4 font-medium">성명</th>
            <th className="px-4 py-4 font-medium">행선지</th>
            <th className="px-4 py-4 text-center font-medium">출발</th>
            <th className="px-4 py-4 text-center font-medium">복귀</th>
            <th className="px-4 py-4 font-medium">비고</th>
            <th className="px-4 py-4 font-medium">기간</th>
            <th className="px-4 py-4 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-base text-gray-500">
                해당 날짜에 등록된 외근이 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const canManage = isAdmin || row.user_id === viewerId;
              return (
                <tr key={row.id} className="border-b border-white/5 text-gray-200">
                  <td className="px-4 py-4">
                    <DeptBadge department={row.department} />
                  </td>
                  <td className="px-4 py-4 font-medium text-white">{row.author_name}</td>
                  <td className="px-4 py-4">{row.destination || "-"}</td>
                  <td className="px-4 py-4 text-center">{row.depart_time || "-"}</td>
                  <td className="px-4 py-4 text-center">{row.return_time || "-"}</td>
                  <td className="px-4 py-4 text-gray-400">
                    {remarkLines(row).length > 0
                      ? remarkLines(row).map((line, i) => <div key={i}>{line}</div>)
                      : "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-400">{periodText(row)}</td>
                  <td className="px-4 py-4">
                    {canManage && (
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/field-trip/${row.id}`}
                          className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
                        >
                          수정
                        </Link>
                        <DeleteTripButton id={row.id} date={date} ym={ym} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
