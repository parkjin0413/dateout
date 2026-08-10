import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isValidDate, todayKst } from "@/lib/schedule/date";
import ScheduleForm from "@/components/main/schedule/schedule-form";
import { createSchedule } from "../actions";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function NewSchedulePage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const params = await searchParams;
  const workDate = params.date && isValidDate(params.date) ? params.date : todayKst();

  return <ScheduleForm mode="create" action={createSchedule} workDate={workDate} />;
}
