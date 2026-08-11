import { BASE_DEPARTMENTS, getDeptRank } from "@/lib/dept";

export { getDeptClass, DEPT_COLORS, getDeptRank } from "@/lib/dept";
export type { DeptClass } from "@/lib/dept";

export const DEPARTMENT_OPTIONS = BASE_DEPARTMENTS;

export function getDeptLabel(dept: string): string {
  return dept.trim();
}

export function compareFieldTrips(
  a: { department: string; author_name: string },
  b: { department: string; author_name: string }
): number {
  const rankDiff = getDeptRank(a.department) - getDeptRank(b.department);
  if (rankDiff !== 0) return rankDiff;
  if (a.department !== b.department) return a.department.localeCompare(b.department, "ko");
  return a.author_name.localeCompare(b.author_name, "ko");
}
