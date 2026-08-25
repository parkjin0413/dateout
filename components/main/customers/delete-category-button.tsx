"use client";

import { useTransition } from "react";

import { deleteCategory } from "@/app/customers/actions";

const DeleteCategoryButton = ({ id, label }: { id: string; label: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`"${label}" 구분을 삭제하시겠습니까?`)) return;
        startTransition(() => {
          deleteCategory(id);
        });
      }}
      className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
    >
      삭제
    </button>
  );
};

export default DeleteCategoryButton;
