export const DEPARTMENT_OPTIONS = ["영업부", "공무부", "홍보부", "관리부"] as const;

export function getDeptLabel(dept: string): string {
  return dept.trim();
}

export function getDeptRank(dept: string): number {
  if (/영업/.test(dept)) return 1;
  if (/(공무|시공|현장)/.test(dept)) return 2;
  if (/(기획|홍보)/.test(dept)) return 3;
  if (/(관리|총무|경영|회계|인사)/.test(dept)) return 4;
  return 99;
}

export type DeptClass = "dept-sales" | "dept-support" | "dept-pr" | "dept-admin" | "dept-prod" | "dept-tech" | "dept-etc";

export function getDeptClass(dept: string): DeptClass {
  const d = dept.trim();
  if (!d) return "dept-etc";
  if (/영업/.test(d)) return "dept-sales";
  if (/(공무|시공|현장)/.test(d)) return "dept-support";
  if (/(기획|홍보)/.test(d)) return "dept-pr";
  if (/(관리|총무|경영|회계|인사)/.test(d)) return "dept-admin";
  if (/(생산|공장|제조)/.test(d)) return "dept-prod";
  if (/(기술|품질|연구)/.test(d)) return "dept-tech";
  return "dept-etc";
}

export const DEPT_COLORS: Record<DeptClass, { bg: string; text: string; border: string }> = {
  "dept-sales": { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" },
  "dept-support": { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-300" },
  "dept-pr": { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300" },
  "dept-admin": { bg: "bg-slate-100", text: "text-slate-900", border: "border-slate-300" },
  "dept-prod": { bg: "bg-green-100", text: "text-green-900", border: "border-green-300" },
  "dept-tech": { bg: "bg-cyan-100", text: "text-cyan-900", border: "border-cyan-300" },
  "dept-etc": { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-300" },
};

export function compareFieldTrips(
  a: { department: string; author_name: string },
  b: { department: string; author_name: string }
): number {
  const rankDiff = getDeptRank(a.department) - getDeptRank(b.department);
  if (rankDiff !== 0) return rankDiff;
  if (a.department !== b.department) return a.department.localeCompare(b.department, "ko");
  return a.author_name.localeCompare(b.author_name, "ko");
}
