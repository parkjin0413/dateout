import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import TripForm from "@/components/main/field-trip/trip-form";
import { updateFieldTrip } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditFieldTripPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: trip } = await supabase.from("field_trips").select("*").eq("id", id).single();
  if (!trip) notFound();
  if (trip.user_id !== user.id && !isAdmin) redirect("/field-trip");

  const boundUpdate = updateFieldTrip.bind(null, id);

  return (
    <TripForm
      mode="edit"
      action={boundUpdate}
      workDate={trip.base_date}
      trip={trip}
      defaultAuthorName={trip.author_name}
      isAdmin={isAdmin}
    />
  );
}
