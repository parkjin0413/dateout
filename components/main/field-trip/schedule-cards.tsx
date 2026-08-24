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

const ScheduleCards = ({ rows, viewerId, isAdmin, date, ym }: Props) => {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E7E2D2] bg-white px-4 py-12 text-center text-base text-[#8A8270] md:hidden">
        해당 날짜에 등록된 외근이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-5 md:hidden">
      {rows.map((row) => {
        const canManage = isAdmin || row.user_id === viewerId;
        return (
          <div key={row.id} className="rounded-2xl border border-[#E7E2D2] bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              <DeptBadge department={row.department} />
              <span className="font-semibold text-[#211D14]">{row.author_name}</span>
              {row.destination && <span className="text-base text-[#6B6455]">{row.destination}</span>}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-[#6B6455]">
              <span>
                {row.depart_time || "-"} ~ {row.return_time || "-"}
              </span>
              <span className="text-[#8A8270]">{periodText(row)}</span>
            </div>

            {remarkLines(row).length > 0 && (
              <div className="mt-3 space-y-1 text-base text-[#6B6455]">
                {remarkLines(row).map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}

            {canManage && (
              <div className="mt-4 flex items-center gap-4 border-t border-[#E7E2D2] pt-4">
                <Link
                  href={`/field-trip/${row.id}`}
                  className="text-sm font-medium text-[#4B4739] transition-colors hover:text-[#211D14]"
                >
                  수정
                </Link>
                <DeleteTripButton id={row.id} date={date} ym={ym} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleCards;
