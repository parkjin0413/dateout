import { requireAdmin } from "@/lib/auth/require-admin";
import EmployeeAccountForm from "@/components/main/admin/employee-account-form";
import { createEmployeeAccount } from "../actions";

export default async function NewEmployeeAccountPage() {
  await requireAdmin("/dashboard");

  return <EmployeeAccountForm mode="create" action={createEmployeeAccount} />;
}
