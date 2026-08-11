import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import DirectoryForm from "@/components/main/directory/directory-form";
import { updateEmployee } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditEmployeePage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/directory");

  const { data: employee } = await supabase.from("employees").select("*").eq("id", id).single();
  if (!employee) notFound();

  const boundUpdate = updateEmployee.bind(null, id);

  return <DirectoryForm mode="edit" action={boundUpdate} employee={employee} />;
}
