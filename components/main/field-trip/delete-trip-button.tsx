"use client";

import { useTransition } from "react";

import { deleteFieldTrip } from "@/app/field-trip/actions";

type Props = {
  id: string;
  date: string;
  ym: string;
};

const DeleteTripButton = ({ id, date, ym }: Props) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        startTransition(() => {
          deleteFieldTrip(id, date, ym);
        });
      }}
      className="text-sm font-medium text-red-600 transition-colors hover:text-red-500 disabled:opacity-50"
    >
      삭제
    </button>
  );
};

export default DeleteTripButton;
