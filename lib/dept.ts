export const BASE_DEPARTMENTS = ["영업부", "공무부", "홍보부", "관리부"] as const;

export type DeptClass =
  | "dept-notice"
  | "dept-sales"
  | "dept-support"
  | "dept-pr"
  | "dept-admin"
  | "dept-prod"
  | "dept-tech"
  | "dept-etc";

export function getDeptClass(dept: string): DeptClass {
  const d = dept.trim();
  if (!d) return "dept-etc";
  if (/공지/.test(d)) return "dept-notice";
  if (/영업/.test(d)) return "dept-sales";
  if (/(공무|시공|현장)/.test(d)) return "dept-support";
  if (/(기획|홍보|마케팅)/.test(d)) return "dept-pr";
  if (/(관리|총무|경영|회계|인사)/.test(d)) return "dept-admin";
  if (/(생산|공장|제조)/.test(d)) return "dept-prod";
  if (/(기술|품질|연구)/.test(d)) return "dept-tech";
  return "dept-etc";
}

export const DEPT_COLORS: Record<DeptClass, { bg: string; text: string; border: string }> = {
  "dept-notice": { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-400/30" },
  "dept-sales": { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-400/30" },
  "dept-support": { bg: "bg-orange-500/15", text: "text-orange-300", border: "border-orange-400/30" },
  "dept-pr": { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-400/30" },
  "dept-admin": { bg: "bg-slate-500/15", text: "text-slate-300", border: "border-slate-400/30" },
  "dept-prod": { bg: "bg-green-500/15", text: "text-green-300", border: "border-green-400/30" },
  "dept-tech": { bg: "bg-cyan-500/15", text: "text-cyan-300", border: "border-cyan-400/30" },
  "dept-etc": { bg: "bg-gray-500/15", text: "text-gray-300", border: "border-gray-400/30" },
};

export function getDeptRank(dept: string): number {
  if (/공지/.test(dept)) return 1;
  if (/영업/.test(dept)) return 2;
  if (/(공무|시공|현장)/.test(dept)) return 3;
  if (/(기획|홍보|마케팅)/.test(dept)) return 4;
  if (/(관리|총무|경영|회계|인사)/.test(dept)) return 5;
  return 99;
}
