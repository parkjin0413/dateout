import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { COMPANY_INFO } from "@/lib/company-info";
import CompanyInfoView from "@/components/main/company/company-info-view";

export default async function CompanyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  return <CompanyInfoView companies={COMPANY_INFO} />;
}
