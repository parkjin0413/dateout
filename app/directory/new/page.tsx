import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import DirectoryForm from "@/components/main/directory/directory-form";
import { createEmployee } from "../actions";

export default async function NewEmployeePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/directory");

  return <DirectoryForm mode="create" action={createEmployee} />;
}
