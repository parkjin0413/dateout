"use client";

import { useTransition } from "react";

import { deleteSchedule } from "@/app/schedule/actions";

type Props = {
  id: string;
  ym: string;
  className?: string;
};

const DeleteScheduleButton = ({ id, ym, className }: Props) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        startTransition(() => {
          deleteSchedule(id, ym);
        });
      }}
      className={className ?? "text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"}
    >
      삭제
    </button>
  );
};

export default DeleteScheduleButton;
