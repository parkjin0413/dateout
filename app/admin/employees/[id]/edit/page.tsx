import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import EmployeeAccountForm from "@/components/main/admin/employee-account-form";
import { updateEmployeeAccount } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditEmployeeAccountPage({ params }: Props) {
  const { id } = await params;

  const { supabase } = await requireAdmin("/dashboard");

  const { data: employee } = await supabase
    .from("users")
    .select("name, company, work_location, department, job_title, phone")
    .eq("id", id)
    .single();
  if (!employee) notFound();

  const boundUpdate = updateEmployeeAccount.bind(null, id);

  return <EmployeeAccountForm mode="edit" action={boundUpdate} employee={employee} />;
}
