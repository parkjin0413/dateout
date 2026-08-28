import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { todayKst } from "@/lib/report/date";
import { getStampSignedUrl } from "@/lib/expense/stamp-image";
import MeetingForm from "@/components/main/forms/meeting-form";
import { createMeetingRecord } from "../actions";

export default async function NewMeetingRecordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("users")
    .select("name, department, job_title, stamp_path")
    .eq("id", user.id)
    .single();

  const { data: employees } = await supabase
    .from("users")
    .select("id, name, department, job_title")
    .order("department", { ascending: true });

  const candidates = (employees ?? []).filter((e) => e.id !== user.id);
  const stampUrl = await getStampSignedUrl(supabase, profile?.stamp_path ?? null);

  return (
    <div>
      {!profile?.stamp_path && (
        <div className="mb-4 rounded-xl border border-[#F0D9A8] bg-[#FFF8E8] px-4 py-3 text-base text-[#7A5A12]">
          등록된 도장이 없습니다. 인쇄 시 기안란에 도장을 자동으로 넣으려면{" "}
          <Link href="/forms/stamp" className="font-semibold underline">
            내 도장 등록
          </Link>
          을 먼저 해주세요.
        </div>
      )}

      <MeetingForm
        mode="create"
        action={createMeetingRecord}
        drafterName={profile?.name ?? user.email ?? ""}
        drafterJobTitle={profile?.job_title ?? ""}
        department={profile?.department ?? ""}
        draftedAt={todayKst()}
        employees={candidates}
        stampUrl={stampUrl}
      />
    </div>
  );
}
