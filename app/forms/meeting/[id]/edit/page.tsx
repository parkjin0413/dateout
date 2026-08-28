import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getStampSignedUrl } from "@/lib/expense/stamp-image";
import type { MeetingApprover, MeetingItem } from "@/lib/meeting/types";
import MeetingForm from "@/components/main/forms/meeting-form";
import { updateMeetingRecord } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditMeetingRecordPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: report } = await supabase.from("meeting_records").select("*").eq("id", id).single();
  if (!report) notFound();
  if (report.drafter_id !== user.id) redirect(`/forms/meeting/${id}`);

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

  const items = report.items as unknown as MeetingItem[];
  const approvers = report.approvers as unknown as MeetingApprover[];
  const approverByOrder = (order: number) => approvers.find((a) => a.order === order)?.userId ?? "";

  return (
    <MeetingForm
      mode="edit"
      action={updateMeetingRecord.bind(null, id)}
      drafterName={profile?.name ?? user.email ?? ""}
      drafterJobTitle={profile?.job_title ?? ""}
      department={profile?.department ?? ""}
      draftedAt={report.drafted_at}
      employees={candidates}
      stampUrl={stampUrl}
      cancelHref={`/forms/meeting/${id}`}
      initial={{
        siteName: report.site_name,
        meetingDate: report.meeting_date,
        location: report.location,
        counterpartName: report.counterpart_name,
        counterpartOrg: report.counterpart_org,
        items: items.map((it) => ({ category: it.category, content: it.content, note: it.note })),
        photoTaken: report.photo_taken,
        drawingAttached: report.drawing_attached,
        approver1: approverByOrder(1),
        approver2: approverByOrder(2),
        approver3: approverByOrder(3),
      }}
    />
  );
}
