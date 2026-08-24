import { createAdminClient } from "@/lib/supabase/admin";

export type LogLevel = "info" | "error";

type WriteLogInput = {
  level: LogLevel;
  action: string;
  message: string;
  actorId: string | null;
  actorName: string;
};

// Best-effort audit log write. Never throws — a logging failure must not
// break the action the caller is actually performing.
export async function writeLog({ level, action, message, actorId, actorName }: WriteLogInput): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("logs").insert({ level, action, message, actor_id: actorId, actor_name: actorName });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
