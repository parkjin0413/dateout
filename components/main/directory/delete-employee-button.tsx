"use client";

import { useTransition } from "react";

import { deleteEmployee } from "@/app/directory/actions";

const DeleteEmployeeButton = ({ id, name }: { id: string; name: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`${name}님을 삭제하시겠습니까?\n삭제된 정보는 되돌릴 수 없습니다.`)) return;
        startTransition(async () => {
          await deleteEmployee(id);
        });
      }}
      className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      삭제
    </button>
  );
};

export default DeleteEmployeeButton;
