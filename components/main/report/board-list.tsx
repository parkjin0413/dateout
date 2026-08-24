import Link from "next/link";

import { BASE_DEPARTMENTS, DEPT_COLORS_LIGHT, getDeptClass } from "@/lib/dept";
import { updateBoardDepartment } from "@/app/report/actions";
import DeleteBoardButton from "./delete-board-button";

type Person = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  department: string;
};

const UNASSIGNED = "미지정";

const inputCls =
  "min-w-0 flex-1 rounded-lg border border-[#E7E2D2] bg-white px-2 py-1 text-sm text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

const groupByDepartment = (people: Person[]) => {
  const order: string[] = [...BASE_DEPARTMENTS];
  const known = new Set<string>(order);
  const extras = Array.from(new Set(people.map((p) => p.department).filter((d) => d && !known.has(d)))).sort((a, b) =>
    a.localeCompare(b, "ko")
  );
  const departments = [...order, ...extras, UNASSIGNED];

  return departments
    .map((department) => ({
      department,
      members: people.filter((p) => (p.department || UNASSIGNED) === department),
    }))
    .filter((g) => g.members.length > 0);
};

const PersonCard = ({ person, isAdmin }: { person: Person; isAdmin: boolean }) => {
  const displayName = person.name ?? person.email;
  const colors = person.department ? DEPT_COLORS_LIGHT[getDeptClass(person.department)] : null;
  const boundUpdate = updateBoardDepartment.bind(null, person.id);

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-[#E7E2D2] bg-white p-5 transition-all duration-300 hover:border-[#0F5C56]/40">
      <Link href={`/report/${person.id}`} className="flex items-center gap-3">
        {person.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.avatar_url}
            alt={displayName}
            className="h-11 w-11 rounded-full border border-[#E7E2D2]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E7E2D2] bg-[#F5F3EA] text-base font-semibold text-[#4B4739]">
            {displayName.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-[#211D14]">{displayName}(업무보고)</span>
            {colors && (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}>
                {person.department}
              </span>
            )}
          </div>
          <div className="truncate text-sm text-[#8A8270]">{person.email}</div>
        </div>
      </Link>

      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[#E7E2D2] pt-3">
          <form action={boundUpdate} className="flex min-w-0 flex-1 items-center gap-2">
            <input
              name="department"
              list="report-department-options"
              defaultValue={person.department}
              placeholder="부서 지정"
              className={inputCls}
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg border border-[#E7E2D2] bg-white px-2.5 py-1 text-sm font-medium text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
            >
              저장
            </button>
          </form>
          <DeleteBoardButton userId={person.id} displayName={displayName} />
        </div>
      )}
    </div>
  );
};

const BoardList = ({ people, isAdmin }: { people: Person[]; isAdmin: boolean }) => {
  if (people.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E7E2D2] bg-white px-4 py-12 text-center text-base text-[#8A8270]">
        아직 등록된 업무보고 게시판이 없습니다.
      </div>
    );
  }

  const groups = groupByDepartment(people);

  return (
    <div className="space-y-8">
      {isAdmin && (
        <datalist id="report-department-options">
          {BASE_DEPARTMENTS.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      )}

      {groups.map(({ department, members }) => (
        <div key={department}>
          <h2 className="mb-3 text-lg font-semibold text-[#211D14]">
            {department} <span className="text-sm font-normal text-[#8A8270]">{members.length}명</span>
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((person) => (
              <PersonCard key={person.id} person={person} isAdmin={isAdmin} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoardList;
