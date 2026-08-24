import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isValidYm } from "@/lib/schedule/date";
import DeleteScheduleButton from "@/components/main/schedule/delete-schedule-button";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ym?: string }>;
};

const periodText = (start: string, end: string) => (start === end ? start : `${start} ~ ${end}`);

export default async function ScheduleDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { ym: ymParam } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: schedule } = await supabase.from("schedules").select("*").eq("id", id).single();
  if (!schedule) notFound();

  const ym = ymParam && isValidYm(ymParam) ? ymParam : schedule.base_date.slice(0, 7);
  const canManage = isAdmin || schedule.user_id === user.id;
  const listHref = `/schedule?ym=${ym}&date=${schedule.base_date}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">일정 상세</h1>
        <p className="mt-1 text-base text-[#6B6455]">기준일 {schedule.base_date}</p>
      </div>

      <div className="max-w-xl space-y-4 rounded-2xl border border-[#E7E2D2] bg-white p-6">
        <Row label="부서" value={schedule.department} />
        <Row label="기간" value={periodText(schedule.trip_start, schedule.trip_end)} />
        <Row label="내용" value={schedule.content} />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Link href={listHref} className="text-base text-[#6B6455] transition-colors hover:text-[#211D14]">
          목록으로
        </Link>

        {canManage && (
          <>
            <Link
              href={`/schedule/${schedule.id}/edit`}
              className="text-base font-medium text-[#4B4739] transition-colors hover:text-[#211D14]"
            >
              수정
            </Link>
            <DeleteScheduleButton
              id={schedule.id}
              ym={ym}
              className="text-base font-medium text-red-600 transition-colors hover:text-red-700"
            />
          </>
        )}
      </div>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
    <div className="w-16 shrink-0 text-base text-[#6B6455]">{label}</div>
    <div className="text-base text-[#211D14]">{value}</div>
  </div>
);
