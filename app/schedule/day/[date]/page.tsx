import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isValidDate, isValidYm } from "@/lib/schedule/date";
import { compareSchedules, DEPT_COLORS_LIGHT, getDeptClass } from "@/lib/schedule/dept";
import DeleteScheduleButton from "@/components/main/schedule/delete-schedule-button";

type Props = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ ym?: string }>;
};

const periodText = (start: string, end: string) => (start === end ? start : `${start} ~ ${end}`);

export default async function ScheduleDayPage({ params, searchParams }: Props) {
  const { date } = await params;
  if (!isValidDate(date)) notFound();

  const { ym: ymParam } = await searchParams;
  const ym = ymParam && isValidYm(ymParam) ? ymParam : date.slice(0, 7);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: rows } = await supabase.from("schedules").select("*").lte("trip_start", date).gte("trip_end", date);

  const schedules = (rows ?? []).slice().sort(compareSchedules);
  const listHref = `/schedule?ym=${ym}&date=${date}`;

  const [year, month, day] = date.split("-").map(Number);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">
            {year}년 {month}월 {day}일 일정
          </h1>
          <p className="mt-1 text-base text-[#6B6455]">등록된 일정 {schedules.length}건</p>
        </div>
        <Link
          href={`/schedule/new?date=${date}`}
          className="rounded-lg bg-[#0F5C56] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
        >
          + 일정 등록
        </Link>
      </div>

      {schedules.length === 0 ? (
        <div className="rounded-2xl border border-[#E7E2D2] bg-white px-4 py-12 text-center text-base text-[#8A8270]">
          이 날짜에 등록된 일정이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => {
            const canManage = isAdmin || schedule.user_id === user.id;
            const colors = DEPT_COLORS_LIGHT[getDeptClass(schedule.department)];
            return (
              <div key={schedule.id} className="rounded-2xl border border-[#E7E2D2] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {schedule.department}
                    </span>
                    <p className="text-base text-[#211D14]">{schedule.content}</p>
                    <p className="text-sm text-[#8A8270]">{periodText(schedule.trip_start, schedule.trip_end)}</p>
                  </div>

                  {canManage && (
                    <div className="flex shrink-0 items-center gap-3">
                      <Link
                        href={`/schedule/${schedule.id}/edit`}
                        className="text-sm font-medium text-[#4B4739] transition-colors hover:text-[#211D14]"
                      >
                        수정
                      </Link>
                      <DeleteScheduleButton
                        id={schedule.id}
                        ym={ym}
                        className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Link href={listHref} className="text-base text-[#6B6455] transition-colors hover:text-[#211D14]">
          ← 목록으로
        </Link>
      </div>
    </div>
  );
}
