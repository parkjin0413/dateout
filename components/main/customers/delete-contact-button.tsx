"use client";

import { useTransition } from "react";

import { deleteContact } from "@/app/customers/actions";

const DeleteContactButton = ({ id, customerId }: { id: string; customerId: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("이 연락 기록을 삭제하시겠습니까?")) return;
        startTransition(() => {
          deleteContact(id, customerId);
        });
      }}
      className="shrink-0 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
    >
      삭제
    </button>
  );
};

export default DeleteContactButton;
