import type { createClient } from "@/lib/supabase/server";

export const STAMP_BUCKET = "stamps";

export function buildStampPath(userId: string, filename: string): string {
  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
  return `${userId}/${Date.now()}${ext}`;
}

export async function getStampSignedUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null
): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(STAMP_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
