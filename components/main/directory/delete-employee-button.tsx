"use client";

import { useTransition } from "react";

import { deleteEmployee } from "@/app/directory/actions";

const DeleteEmployeeButton = ({ id }: { id: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        startTransition(() => {
          deleteEmployee(id);
        });
      }}
      className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
    >
      삭제
    </button>
  );
};

export default DeleteEmployeeButton;
