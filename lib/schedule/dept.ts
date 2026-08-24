import { BASE_DEPARTMENTS, getDeptRank } from "@/lib/dept";

export { getDeptClass, DEPT_COLORS, DEPT_COLORS_LIGHT, getDeptRank } from "@/lib/dept";
export type { DeptClass } from "@/lib/dept";

export const DEPARTMENT_OPTIONS = ["공지", ...BASE_DEPARTMENTS] as const;

export function compareSchedules(
  a: { department: string; created_at: string },
  b: { department: string; created_at: string }
): number {
  const rankDiff = getDeptRank(a.department) - getDeptRank(b.department);
  if (rankDiff !== 0) return rankDiff;
  return a.created_at.localeCompare(b.created_at);
}
