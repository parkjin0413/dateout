import { redirect } from "next/navigation";

import Hero from "@/components/main/hero";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return <Hero />;
}
