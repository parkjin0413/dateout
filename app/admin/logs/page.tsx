import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  searchParams: Promise<{ q?: string; level?: string }>;
};

const LOG_LIMIT = 200;

const StatIcon = ({ kind }: { kind: "total" | "info" | "error" }) => {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "info")
    return (
      <svg {...common} className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5.5M12 8v.01" />
      </svg>
    );
  if (kind === "error")
    return (
      <svg {...common} className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16v.01" />
      </svg>
    );
  return (
    <svg {...common} className="h-5 w-5">
      <path d="M3.5 12h4l2-6 4 12 2-6h4.5" />
    </svg>
  );
};

const StatCard = ({ label, value, icon }: { label: string; value: number; icon: "total" | "info" | "error" }) => (
  <div className="rounded-2xl border border-[#E7E2D2] bg-white p-4">
    <div className="flex items-start justify-between gap-2 text-[#8A8270]">
      <span className="break-keep text-sm font-medium">{label}</span>
      <StatIcon kind={icon} />
    </div>
    <div className="mt-1.5 font-mono text-3xl font-bold text-[#211D14]">{value}</div>
  </div>
);

const buildHref = (q: string, level: string | null) => {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (level) params.set("level", level);
  const qs = params.toString();
  return `/admin/logs${qs ? `?${qs}` : ""}`;
};

export default async function AdminLogsPage({ searchParams }: Props) {
  await requireAdmin("/dashboard");

  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const level = params.level === "info" || params.level === "error" ? params.level : null;

  const admin = createAdminClient();

  const [{ count: totalCount }, { count: infoCount }, { count: errorCount }] = await Promise.all([
    admin.from("logs").select("id", { count: "exact", head: true }),
    admin.from("logs").select("id", { count: "exact", head: true }).eq("level", "info"),
    admin.from("logs").select("id", { count: "exact", head: true }).eq("level", "error"),
  ]);

  let query = admin
    .from("logs")
    .select("id, level, action, message, actor_name, created_at")
    .order("created_at", { ascending: false })
    .limit(LOG_LIMIT);

  if (level) query = query.eq("level", level);
  if (q) {
    const safeQ = q.replace(/[,()]/g, " ").trim();
    if (safeQ) query = query.or(`message.ilike.%${safeQ}%,action.ilike.%${safeQ}%,actor_name.ilike.%${safeQ}%`);
  }

  const { data: rows } = await query;
  const logs = rows ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">로그 관리</h1>
        <p className="mt-1 text-base text-[#6B6455]">에러는 반갑지 않지만 단서는 늘 남겨둡니다.</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="총 로그" value={totalCount ?? 0} icon="total" />
        <StatCard label="INFO" value={infoCount ?? 0} icon="info" />
        <StatCard label="ERROR" value={errorCount ?? 0} icon="error" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E7E2D2] bg-white p-3">
        <form method="get" className="min-w-0 flex-1">
          {level && <input type="hidden" name="level" value={level} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="메시지, 액션, 사용자명으로 검색"
            className="w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none placeholder:text-[#B9B29B]"
          />
        </form>

        <div className="flex items-center gap-1.5">
          <Link
            href={buildHref(q, null)}
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              !level ? "bg-[#0F5C56] text-white" : "text-[#4B4739] hover:bg-[#F5F3EA]",
            ].join(" ")}
          >
            전체
          </Link>
          <Link
            href={buildHref(q, "info")}
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              level === "info" ? "bg-[#0F5C56] text-white" : "text-[#4B4739] hover:bg-[#F5F3EA]",
            ].join(" ")}
          >
            INFO
          </Link>
          <Link
            href={buildHref(q, "error")}
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              level === "error" ? "bg-[#0F5C56] text-white" : "text-[#4B4739] hover:bg-[#F5F3EA]",
            ].join(" ")}
          >
            ERROR
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E7E2D2] bg-white">
        <table className="w-full min-w-[760px] text-base">
          <thead>
            <tr className="border-b border-[#E7E2D2] text-left text-sm text-[#8A8270]">
              <th className="px-4 py-4 font-medium">레벨</th>
              <th className="px-4 py-4 font-medium">액션</th>
              <th className="px-4 py-4 font-medium">메시지</th>
              <th className="px-4 py-4 font-medium">사용자</th>
              <th className="px-4 py-4 font-medium">시간</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-base text-[#8A8270]">
                  조건에 맞는 로그가 없습니다.
                </td>
              </tr>
            ) : (
              logs.map((row) => (
                <tr key={row.id} className="border-b border-[#EDE7D3] text-[#4B4739]">
                  <td className="px-4 py-4">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        row.level === "error"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-[#CFE3E0] bg-[#E3EFEC] text-[#0F5C56]",
                      ].join(" ")}
                    >
                      {row.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">{row.action}</td>
                  <td className="px-4 py-4">{row.message}</td>
                  <td className="px-4 py-4">{row.actor_name || "-"}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-[#8A8270]">
                    {new Date(row.created_at).toLocaleString("ko-KR", {
                      timeZone: "Asia/Seoul",
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
