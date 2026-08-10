import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ScheduleForm from "@/components/main/schedule/schedule-form";
import { updateSchedule } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSchedulePage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: schedule } = await supabase.from("schedules").select("*").eq("id", id).single();
  if (!schedule) notFound();
  if (schedule.user_id !== user.id && !isAdmin) redirect("/schedule");

  const boundUpdate = updateSchedule.bind(null, id);

  return <ScheduleForm mode="edit" action={boundUpdate} workDate={schedule.base_date} schedule={schedule} />;
}
