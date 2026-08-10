import { createReportBoard } from "@/app/report/actions";

type Candidate = {
  id: string;
  name: string | null;
  email: string;
};

const AddBoardForm = ({ candidates }: { candidates: Candidate[] }) => {
  if (candidates.length === 0) {
    return (
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-gray-500">
        게시판을 추가할 수 있는 인원이 없습니다. (모든 가입자에게 이미 게시판이 있습니다)
      </div>
    );
  }

  return (
    <form action={createReportBoard} className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className="text-base font-medium text-gray-300">게시판 추가</span>
      <select
        name="user_id"
        required
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white outline-none"
      >
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {(c.name ?? c.email)}({c.email})
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg border border-white/30 px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-white hover:text-black"
      >
        추가
      </button>
    </form>
  );
};

export default AddBoardForm;
