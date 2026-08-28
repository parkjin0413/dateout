"use client";

import { useTransition } from "react";

import { deleteEmployeeAccount } from "@/app/admin/employees/actions";

const DeleteEmployeeAccountButton = ({ id, name }: { id: string; name: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`${name}님의 계정을 삭제하시겠습니까?\n로그인 계정과 직원 정보가 모두 삭제되며 되돌릴 수 없습니다.`)) return;
        startTransition(async () => {
          await deleteEmployeeAccount(id);
        });
      }}
      className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
    >
      삭제
    </button>
  );
};

export default DeleteEmployeeAccountButton;
