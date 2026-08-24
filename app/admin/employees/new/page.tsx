import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import EmployeeAccountForm from "@/components/main/admin/employee-account-form";

export default async function NewEmployeeAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  return <EmployeeAccountForm />;
}
