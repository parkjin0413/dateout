import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateCustomer } from "@/app/customers/actions";
import CustomerForm from "@/components/main/customers/customer-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: customer } = await supabase.from("customers").select("*").eq("id", id).single();
  if (!customer) notFound();
  if (customer.owner_id !== user.id && !isAdmin) redirect(`/customers/${id}`);

  const { data: categories } = await supabase
    .from("customer_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const boundUpdate = updateCustomer.bind(null, id);

  return <CustomerForm mode="edit" action={boundUpdate} categories={categories ?? []} customer={customer} />;
}
