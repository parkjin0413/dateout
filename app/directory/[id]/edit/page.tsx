import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import DirectoryForm from "@/components/main/directory/directory-form";
import { updateEmployee } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditEmployeePage({ params }: Props) {
  const { id } = await params;

  const { supabase } = await requireAdmin("/directory");

  const { data: employee } = await supabase.from("employees").select("*").eq("id", id).single();
  if (!employee) notFound();

  const boundUpdate = updateEmployee.bind(null, id);

  return <DirectoryForm mode="edit" action={boundUpdate} employee={employee} />;
}
