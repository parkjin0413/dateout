import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getStampSignedUrl } from "@/lib/expense/stamp-image";
import type { MeetingApprover, MeetingItem } from "@/lib/meeting/types";
import MeetingDocument from "@/components/main/forms/meeting-document";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MeetingRecordViewPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();

  const { data: report } = await supabase.from("meeting_records").select("*").eq("id", id).single();
  if (!report) notFound();
  if (report.drafter_id !== user.id && !profile?.is_admin) notFound();

  const { data: drafter } = await supabase.from("users").select("job_title, stamp_path").eq("id", report.drafter_id).single();
  const stampUrl = await getStampSignedUrl(supabase, drafter?.stamp_path ?? null);

  return (
    <MeetingDocument
      report={{
        id: report.id,
        doc_number: report.doc_number,
        drafter_id: report.drafter_id,
        drafter_name: report.drafter_name,
        drafter_job_title: drafter?.job_title ?? "",
        department: report.department,
        drafted_at: report.drafted_at,
        site_name: report.site_name,
        meeting_date: report.meeting_date,
        location: report.location,
        counterpart_name: report.counterpart_name,
        counterpart_org: report.counterpart_org,
        items: report.items as unknown as MeetingItem[],
        photo_taken: report.photo_taken,
        drawing_attached: report.drawing_attached,
        approvers: report.approvers as unknown as MeetingApprover[],
      }}
      stampUrl={stampUrl}
      canManage={report.drafter_id === user.id}
    />
  );
}
