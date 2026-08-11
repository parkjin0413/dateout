import Link from "next/link";

import { DEPT_COLORS, getDeptClass } from "@/lib/directory/dept";
import type { Employee } from "@/lib/directory/types";
import DeleteEmployeeButton from "./delete-employee-button";

type Props = {
  groups: { department: string; members: Employee[] }[];
  isAdmin: boolean;
};

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const EmployeeCard = ({ employee, isAdmin }: { employee: Employee; isAdmin: boolean }) => {
  const colors = DEPT_COLORS[getDeptClass(employee.department)];

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-lg shadow-black/40 backdrop-blur-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${colors.bg} ${colors.text}`}
      >
        {employee.name.slice(0, 1)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-base font-semibold text-gray-900">{employee.name}</span>
          <span className="text-sm text-gray-500">{employee.job_title}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {employee.department}
          </span>
          <a
            href={`tel:${employee.phone}`}
            className="inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <PhoneIcon />
            {employee.phone}
          </a>
        </div>
      </div>

      {isAdmin && (
        <div className="flex shrink-0 items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
          <Link
            href={`/directory/${employee.id}/edit`}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            수정
          </Link>
          <DeleteEmployeeButton id={employee.id} />
        </div>
      )}
    </div>
  );
};

const DirectoryList = ({ groups, isAdmin }: Props) => {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-16 text-center text-base text-gray-500">
        아직 등록된 직원이 없습니다.
        {isAdmin && (
          <>
            {" "}
            <Link href="/directory/new" className="text-purple-300 hover:underline">
              직원 추가하기
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(({ department, members }) => (
        <div key={department}>
          <h2 className="mb-3 text-lg font-semibold text-white">
            {department} <span className="text-sm font-normal text-gray-500">{members.length}명</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} isAdmin={isAdmin} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DirectoryList;
