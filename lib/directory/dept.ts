import { BASE_DEPARTMENTS, getDeptRank } from "@/lib/dept";

export { getDeptClass, DEPT_COLORS } from "@/lib/dept";
export type { DeptClass } from "@/lib/dept";

export const DEPARTMENT_OPTIONS = BASE_DEPARTMENTS;

export function compareEmployees(a: { department: string; name: string }, b: { department: string; name: string }): number {
  const rankDiff = getDeptRank(a.department) - getDeptRank(b.department);
  if (rankDiff !== 0) return rankDiff;
  return a.name.localeCompare(b.name, "ko");
}
