import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isValidDate, todayKst } from "@/lib/field-trip/date";
import TripForm from "@/components/main/field-trip/trip-form";
import { createFieldTrip } from "../actions";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function NewFieldTripPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("name, is_admin").eq("id", user.id).single();

  const params = await searchParams;
  const workDate = params.date && isValidDate(params.date) ? params.date : todayKst();

  return (
    <TripForm
      mode="create"
      action={createFieldTrip}
      workDate={workDate}
      defaultAuthorName={profile?.name ?? user.email ?? ""}
      isAdmin={profile?.is_admin ?? false}
    />
  );
}
