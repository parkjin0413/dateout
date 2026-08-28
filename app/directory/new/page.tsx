import { requireAdmin } from "@/lib/auth/require-admin";
import DirectoryForm from "@/components/main/directory/directory-form";
import { createEmployee } from "../actions";

export default async function NewEmployeePage() {
  await requireAdmin("/directory");

  return <DirectoryForm mode="create" action={createEmployee} />;
}
