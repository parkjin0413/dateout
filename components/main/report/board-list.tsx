import Link from "next/link";

type Person = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
};

const BoardList = ({ people }: { people: Person[] }) => {
  if (people.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-12 text-center text-base text-gray-500">
        아직 등록된 업무보고 게시판이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((person) => {
        const displayName = person.name ?? person.email;
        return (
          <Link
            key={person.id}
            href={`/report/${person.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-400/30 hover:bg-white/[0.06]"
          >
            {person.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.avatar_url}
                alt={displayName}
                className="h-11 w-11 rounded-full border border-white/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base font-semibold text-gray-300">
                {displayName.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">{displayName}(업무보고)</div>
              <div className="truncate text-sm text-gray-500">{person.email}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default BoardList;
