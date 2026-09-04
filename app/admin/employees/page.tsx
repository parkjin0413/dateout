import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import DeleteEmployeeAccountButton from "@/components/main/admin/delete-employee-account-button";

const StatIcon = ({ kind }: { kind: "total" | "admin" | "staff" }) => {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "admin")
    return (
      <svg {...common} className="h-5 w-5">
        <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7 7 9 4.1-2 7-4.8 7-9V6z" />
      </svg>
    );
  if (kind === "staff")
    return (
      <svg {...common} className="h-5 w-5">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.6-3 2.7-5 5.5-5s4.9 2 5.5 5" />
      </svg>
    );
  return (
    <svg {...common} className="h-5 w-5">
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M2.5 19c.5-2.8 2.6-4.7 5.5-4.7s5 1.9 5.5 4.7" />
      <path d="M10.5 14.5c.4-2.4 2.3-4 4.5-4s4.1 1.6 4.5 4" />
    </svg>
  );
};

const StatCard = ({ label, value, icon }: { label: string; value: number; icon: "total" | "admin" | "staff" }) => (
  <div className="rounded-2xl border border-[#E7E2D2] bg-white p-4">
    <div className="flex items-start justify-between gap-2 text-[#8A8270]">
      <span className="break-keep text-sm font-medium">{label}</span>
      <StatIcon kind={icon} />
    </div>
    <div className="mt-1.5 font-mono text-3xl font-bold text-[#211D14]">{value}</div>
  </div>
);

export default async function AdminEmployeesPage() {
  const { supabase, user } = await requireAdmin("/dashboard");

  const { data: employees } = await supabase
    .from("users")
    .select("id, name, email, company, work_location, department, job_title, phone, is_admin, created_at")
    .order("created_at", { ascending: true });

  const rows = employees ?? [];
  const adminCount = rows.filter((r) => r.is_admin).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">직원 관리</h1>
          <p className="mt-1 text-base text-[#6B6455]">로그인 계정과 직원 정보를 관리하세요.</p>
        </div>
        <Link
          href="/admin/employees/new"
          className="flex items-center rounded-xl bg-[#0F5C56] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
        >
          + 직원 추가
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="전체 직원" value={rows.length} icon="total" />
        <StatCard label="관리자" value={adminCount} icon="admin" />
        <StatCard label="일반 직원" value={rows.length - adminCount} icon="staff" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E7E2D2] bg-white">
        <table className="w-full min-w-[1020px] text-base">
          <thead>
            <tr className="border-b border-[#E7E2D2] text-left text-sm text-[#8A8270]">
              <th className="px-4 py-4 font-medium">이름</th>
              <th className="px-4 py-4 font-medium">소속</th>
              <th className="px-4 py-4 font-medium">근무지</th>
              <th className="px-4 py-4 font-medium">부서</th>
              <th className="px-4 py-4 font-medium">직급</th>
              <th className="px-4 py-4 font-medium">권한</th>
              <th className="px-4 py-4 font-medium">계정(이메일)</th>
              <th className="px-4 py-4 font-medium">전화번호</th>
              <th className="px-4 py-4 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-base text-[#8A8270]">
                  등록된 직원이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-[#EDE7D3] text-[#4B4739]">
                  <td className="px-4 py-4 font-medium text-[#211D14]">{row.name || "-"}</td>
                  <td className="px-4 py-4">{row.company || "-"}</td>
                  <td className="px-4 py-4">{row.work_location || "-"}</td>
                  <td className="px-4 py-4">{row.department || "-"}</td>
                  <td className="px-4 py-4">{row.job_title || "-"}</td>
                  <td className="px-4 py-4">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        row.is_admin ? "border-[#CFE3E0] bg-[#E3EFEC] text-[#0F5C56]" : "border-[#E7E2D2] bg-[#FAF8F0] text-[#6B6455]",
                      ].join(" ")}
                    >
                      {row.is_admin ? "관리자" : "직원"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#6B6455]">{row.email}</td>
                  <td className="px-4 py-4 text-[#6B6455]">{row.phone || "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/employees/${row.id}/edit`}
                        className="text-sm font-medium text-[#0F5C56] transition-colors hover:text-[#0C4A45]"
                      >
                        수정
                      </Link>
                      {row.id !== user.id && <DeleteEmployeeAccountButton id={row.id} name={row.name || row.email} />}
                    </div>
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
