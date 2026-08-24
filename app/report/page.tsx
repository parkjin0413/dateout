import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import BoardList from "@/components/main/report/board-list";
import AddBoardForm from "@/components/main/report/add-board-form";

type Props = {
  searchParams: Promise<{ view?: string }>;
};

export default async function ReportPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { view } = await searchParams;
  const showAll = view === "all";

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: boards } = await supabase
    .from("report_boards")
    .select("user_id, created_at, department")
    .order("created_at", { ascending: true });

  const boardUserIds = (boards ?? []).map((b) => b.user_id);
  if (!isAdmin && !showAll && boardUserIds.includes(user.id)) redirect(`/report/${user.id}`);

  const departmentByUser = new Map((boards ?? []).map((b) => [b.user_id, b.department]));

  const { data: people } =
    boardUserIds.length > 0
      ? await supabase.from("users").select("id, name, email, avatar_url").in("id", boardUserIds)
      : { data: [] };

  const peopleMap = new Map((people ?? []).map((p) => [p.id, p]));
  const orderedPeople = boardUserIds
    .map((id) => peopleMap.get(id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({ ...p, department: departmentByUser.get(p.id) ?? "" }));

  let candidates: { id: string; name: string | null; email: string }[] = [];
  if (isAdmin) {
    const { data: allUsers } = await supabase.from("users").select("id, name, email").order("email", { ascending: true });
    const boardSet = new Set(boardUserIds);
    candidates = (allUsers ?? []).filter((u) => !boardSet.has(u.id));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">업무 보고</h1>
        <p className="mt-1 text-base text-[#6B6455]">개인별 업무보고 게시판입니다. 본인 게시판을 찾아 작성하거나 동료의 보고를 확인해보세요.</p>
      </div>

      {isAdmin && <AddBoardForm candidates={candidates} />}

      <BoardList people={orderedPeople} isAdmin={isAdmin} />
    </div>
  );
}
