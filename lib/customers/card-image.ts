import type { createClient } from "@/lib/supabase/server";

export const CARD_IMAGE_BUCKET = "customer-cards";

export function buildCardImagePath(customerId: string, filename: string): string {
  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
  return `${customerId}/${Date.now()}${ext}`;
}

export async function getCardImageSignedUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null
): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(CARD_IMAGE_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
