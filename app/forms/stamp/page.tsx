import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getStampSignedUrl } from "@/lib/expense/stamp-image";
import StampForm from "@/components/main/forms/stamp-form";

export default async function StampSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("stamp_path").eq("id", user.id).single();
  const stampUrl = await getStampSignedUrl(supabase, profile?.stamp_path ?? null);

  return <StampForm stampUrl={stampUrl} />;
}
