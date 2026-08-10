export const DEPARTMENT_OPTIONS = ["공지", "영업부", "공무부", "홍보부", "관리부"] as const;

export type DeptClass = "dept-notice" | "dept-sales" | "dept-support" | "dept-admin" | "dept-prod" | "dept-tech" | "dept-etc";

export function getDeptClass(dept: string): DeptClass {
  const d = dept.trim();
  if (!d) return "dept-etc";
  if (/공지/.test(d)) return "dept-notice";
  if (/영업/.test(d)) return "dept-sales";
  if (/(공무|시공|현장)/.test(d)) return "dept-support";
  if (/(관리|총무|경영|회계|인사)/.test(d)) return "dept-admin";
  if (/(생산|공장|제조)/.test(d)) return "dept-prod";
  if (/(기술|품질|연구|기획|홍보|마케팅)/.test(d)) return "dept-tech";
  return "dept-etc";
}

export const DEPT_COLORS: Record<DeptClass, { bg: string; text: string; border: string }> = {
  "dept-notice": { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300" },
  "dept-sales": { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" },
  "dept-support": { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-300" },
  "dept-admin": { bg: "bg-slate-100", text: "text-slate-900", border: "border-slate-300" },
  "dept-prod": { bg: "bg-green-100", text: "text-green-900", border: "border-green-300" },
  "dept-tech": { bg: "bg-cyan-100", text: "text-cyan-900", border: "border-cyan-300" },
  "dept-etc": { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-300" },
};

export function getDeptRank(dept: string): number {
  if (/공지/.test(dept)) return 1;
  if (/영업/.test(dept)) return 2;
  if (/(공무|시공|현장)/.test(dept)) return 3;
  if (/(기획|홍보|마케팅)/.test(dept)) return 4;
  if (/(관리|총무|경영|회계|인사)/.test(dept)) return 5;
  return 99;
}

export function compareSchedules(
  a: { department: string; created_at: string },
  b: { department: string; created_at: string }
): number {
  const rankDiff = getDeptRank(a.department) - getDeptRank(b.department);
  if (rankDiff !== 0) return rankDiff;
  return a.created_at.localeCompare(b.created_at);
}
