import { redirect } from "next/navigation";

import Dashboard from "@/components/main/dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/auth");
  }

  const userMetadata = (claims.user_metadata ?? {}) as Record<string, string | undefined>;
  const name = userMetadata.full_name ?? userMetadata.name ?? claims.email ?? "사용자";
  const avatarUrl = userMetadata.avatar_url;

  return <Dashboard name={name} avatarUrl={avatarUrl} />;
}
