"use client";

import { useTransition } from "react";

import { deleteReportBoard } from "@/app/report/actions";

const DeleteBoardButton = ({ userId, displayName }: { userId: string; displayName: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (
          !confirm(
            `${displayName}님의 업무보고 게시판을 삭제하시겠습니까?\n작성된 업무보고가 모두 함께 삭제되며 되돌릴 수 없습니다.`
          )
        )
          return;
        startTransition(() => {
          deleteReportBoard(userId);
        });
      }}
      className="shrink-0 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
    >
      게시판 삭제
    </button>
  );
};

export default DeleteBoardButton;
