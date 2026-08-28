import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireUser(unauthenticatedRedirectTo = "/auth") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(unauthenticatedRedirectTo);

  return { supabase, user };
}

export async function requireAdmin(notAdminRedirectTo: string, unauthenticatedRedirectTo = "/auth") {
  const { supabase, user } = await requireUser(unauthenticatedRedirectTo);

  const { data: profile } = await supabase.from("users").select("is_admin, name").eq("id", user.id).single();
  if (!profile?.is_admin) redirect(notAdminRedirectTo);

  return { supabase, user, name: profile.name ?? null };
}
