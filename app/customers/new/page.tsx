import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createCustomer } from "@/app/customers/actions";
import CustomerForm from "@/components/main/customers/customer-form";

export default async function NewCustomerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: categories } = await supabase
    .from("customer_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return <CustomerForm mode="create" action={createCustomer} categories={categories ?? []} />;
}
