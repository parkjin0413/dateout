import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

// Service-role client for privileged server-only operations (creating auth
// users, writing audit logs). Never import this from client components —
// the key it uses bypasses Row Level Security entirely.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. .env.local을 확인해주세요.");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
