"use client";

import { useTransition } from "react";

import { deleteWorkReport } from "@/app/report/actions";

type Props = {
  id: string;
  userId: string;
  className?: string;
};

const DeleteReportButton = ({ id, userId, className }: Props) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        startTransition(() => {
          deleteWorkReport(id, userId);
        });
      }}
      className={className ?? "text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"}
    >
      삭제
    </button>
  );
};

export default DeleteReportButton;
