import { BASE_DEPARTMENTS, getDeptRank, getJobTitleRank } from "@/lib/dept";

export { getDeptClass, DEPT_COLORS, DEPT_COLORS_LIGHT } from "@/lib/dept";
export type { DeptClass } from "@/lib/dept";

export const DEPARTMENT_OPTIONS = BASE_DEPARTMENTS;

// 같은 부서 안에서는 직급(전무>이사>실장>부장>차장>과장>대리>주임>사원) 순으로 정렬합니다.
export function compareEmployees(
  a: { department: string; name: string; job_title: string },
  b: { department: string; name: string; job_title: string }
): number {
  const rankDiff = getDeptRank(a.department) - getDeptRank(b.department);
  if (rankDiff !== 0) return rankDiff;
  const jobTitleDiff = getJobTitleRank(a.job_title) - getJobTitleRank(b.job_title);
  if (jobTitleDiff !== 0) return jobTitleDiff;
  return a.name.localeCompare(b.name, "ko");
}
