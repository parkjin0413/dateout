import { redirect } from "next/navigation";

import Dashboard from "@/components/main/dashboard";
import { createClient } from "@/lib/supabase/server";
import { todayKst } from "@/lib/schedule/date";

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

  const today = todayKst();

  const [{ count: fieldTripCount }, { count: scheduleCount }, { count: reportCount }] = await Promise.all([
    supabase
      .from("field_trips")
      .select("id", { count: "exact", head: true })
      .lte("trip_start", today)
      .gte("trip_end", today),
    supabase
      .from("schedules")
      .select("id", { count: "exact", head: true })
      .lte("trip_start", today)
      .gte("trip_end", today),
    supabase
      .from("work_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", claims.sub)
      .eq("report_date", today),
  ]);

  return (
    <Dashboard
      name={name}
      avatarUrl={avatarUrl}
      fieldTripCount={fieldTripCount ?? 0}
      scheduleCount={scheduleCount ?? 0}
      hasReportToday={(reportCount ?? 0) > 0}
    />
  );
}
