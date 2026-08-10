"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";

import type { ReportFormState } from "@/app/report/actions";
import { formatKoreanDateTitle } from "@/lib/report/date";
import type { WorkReport } from "@/lib/report/types";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white outline-none transition-colors focus:border-purple-400/50";

type Props = {
  mode: "create" | "edit";
  action: (state: ReportFormState, formData: FormData) => Promise<ReportFormState>;
  userId: string;
  workDate: string;
  report?: WorkReport;
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-base font-medium text-gray-300">{label}</label>
    {children}
  </div>
);

const ReportForm = ({ mode, action, userId, workDate, report }: Props) => {
  const [state, formAction, isPending] = useActionState(action, null);

  const initialDate = report?.report_date ?? workDate;
  const [reportDate, setReportDate] = useState(initialDate);
  const [title, setTitle] = useState(report?.title ?? formatKoreanDateTitle(initialDate));
  // If the saved title still matches the auto-generated pattern for its date,
  // keep following date changes; a custom title stops the auto-sync.
  const [titleTouched, setTitleTouched] = useState(
    report ? report.title !== formatKoreanDateTitle(report.report_date) : false
  );

  const listHref = `/report/${userId}`;

  return (
    <div className="relative min-h-screen w-full bg-[#181818]">
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-32 sm:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{mode === "create" ? "업무보고 작성" : "업무보고 수정"}</h1>
        </div>

        <form action={formAction} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <Field label="날짜">
            <input
              type="date"
              name="report_date"
              value={reportDate}
              onChange={(e) => {
                const value = e.target.value;
                setReportDate(value);
                if (!titleTouched) setTitle(formatKoreanDateTitle(value));
              }}
              required
              className={inputCls}
            />
          </Field>

          <Field label="제목">
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleTouched(true);
              }}
              required
              className={inputCls}
            />
          </Field>

          <Field label="금일 업무">
            <textarea
              name="today_work"
              defaultValue={report?.today_work ?? ""}
              rows={5}
              placeholder="오늘 진행한 업무를 적어주세요."
              className={inputCls}
            />
          </Field>

          <Field label="명일 업무">
            <textarea
              name="tomorrow_work"
              defaultValue={report?.tomorrow_work ?? ""}
              rows={5}
              placeholder="내일 진행할 업무를 적어주세요."
              className={inputCls}
            />
          </Field>

          {state?.error && <p className="text-base text-red-400">{state.error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-white px-5 py-2.5 text-base font-semibold text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "저장 중..." : mode === "create" ? "등록" : "수정하기"}
            </button>
            <Link href={listHref} className="text-base text-gray-400 transition-colors hover:text-white">
              목록으로
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
