import { redirect } from "next/navigation";

import Auth from "@/components/main/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AuthPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return <Auth />;
}
