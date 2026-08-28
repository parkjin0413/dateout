import { requireAdmin } from "@/lib/auth/require-admin";
import EmployeeAccountForm from "@/components/main/admin/employee-account-form";

export default async function NewEmployeeAccountPage() {
  await requireAdmin("/dashboard");

  return <EmployeeAccountForm />;
}
