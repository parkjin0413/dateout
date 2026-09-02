"use client";

import { useActionState } from "react";
import Link from "next/link";

import { uploadStamp, removeStamp } from "@/app/forms/stamp/actions";

type Props = {
  stampUrl: string | null;
};

const StampForm = ({ stampUrl }: Props) => {
  const [state, formAction, isPending] = useActionState(uploadStamp, null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">내 도장 등록</h1>
        <p className="mt-1 text-base text-[#6B6455]">
          등록해두면 품의서를 인쇄할 때 기안자 결재란에 자동으로 도장이 들어갑니다.
        </p>
      </div>

      <div className="max-w-xl space-y-5 rounded-2xl border border-[#E7E2D2] bg-white p-6">
        {stampUrl && (
          <div>
            <label className="mb-1.5 block text-base font-medium text-[#4B4739]">현재 등록된 도장</label>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- 비공개 버킷 서명 URL */}
              <img src={stampUrl} alt="내 도장" className="h-24 w-24 rounded-lg border border-[#E7E2D2] object-contain p-2" />
              <form action={removeStamp}>
                <button
                  type="submit"
                  className="rounded-lg border border-[#E7E2D2] px-4 py-2 text-sm font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
                >
                  도장 삭제
                </button>
              </form>
            </div>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-base font-medium text-[#4B4739]">
              {stampUrl ? "새 도장 이미지로 교체" : "도장 이미지 업로드"}
            </label>
            <input
              type="file"
              name="stamp_image"
              accept="image/png,image/jpeg,image/webp"
              required
              className="w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#F5F3EA] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#4B4739]"
            />
            <p className="mt-1.5 text-sm text-[#8A8270]">배경이 투명한 PNG 이미지를 권장합니다.</p>
          </div>

          {state?.error && <p className="text-base text-red-600">{state.error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#0F5C56] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "저장 중..." : "등록하기"}
            </button>
            <Link href="/forms" className="text-base text-[#6B6455] transition-colors hover:text-[#211D14]">
              돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StampForm;
