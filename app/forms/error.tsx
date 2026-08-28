"use client";

import { useEffect } from "react";

export default function FormsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-base font-medium text-[#211D14]">문제가 발생했습니다. 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-[#0F5C56] px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-[#0C4A45]"
      >
        다시 시도
      </button>
    </div>
  );
}
