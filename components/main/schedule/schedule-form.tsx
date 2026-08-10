"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";

import type { ScheduleFormState } from "@/app/schedule/actions";
import { DEPARTMENT_OPTIONS } from "@/lib/schedule/dept";
import type { Schedule } from "@/lib/schedule/types";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white outline-none transition-colors focus:border-purple-400/50";

type Props = {
  mode: "create" | "edit";
  action: (state: ScheduleFormState, formData: FormData) => Promise<ScheduleFormState>;
  workDate: string;
  schedule?: Schedule;
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-base font-medium text-gray-300">{label}</label>
    {children}
  </div>
);

const ScheduleForm = ({ mode, action, workDate, schedule }: Props) => {
  const [state, formAction, isPending] = useActionState(action, null);

  const [tripEnabled, setTripEnabled] = useState(!!schedule && schedule.trip_start !== schedule.trip_end);
  const [tripStart, setTripStart] = useState(schedule?.trip_start ?? workDate);
  const [tripEnd, setTripEnd] = useState(schedule?.trip_end ?? workDate);

  const listHref = `/schedule?ym=${workDate.slice(0, 7)}&date=${workDate}`;

  return (
    <div className="relative min-h-screen w-full bg-[#181818]">
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-32 sm:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{mode === "create" ? "일정 입력" : "일정 수정"}</h1>
          <p className="mt-1 text-base text-gray-400">날짜 {workDate}</p>
        </div>

        <form action={formAction} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <input type="hidden" name="base_date" value={workDate} />
          <input type="hidden" name="trip_enabled" value={tripEnabled ? "on" : ""} />
          <input type="hidden" name="trip_start" value={tripEnabled ? tripStart : workDate} />
          <input type="hidden" name="trip_end" value={tripEnabled ? tripEnd : workDate} />

          <Field label="부서">
            <select name="department" defaultValue={schedule?.department ?? ""} required className={inputCls}>
              <option value="" disabled>
                선택하세요
              </option>
              {DEPARTMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="기간">
            <label className="flex items-center gap-2 text-base text-gray-300">
              <input
                type="checkbox"
                checked={tripEnabled}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setTripEnabled(checked);
                  if (checked) {
                    setTripStart((s) => s || workDate);
                    setTripEnd((s) => s || workDate);
                  } else {
                    setTripStart(workDate);
                    setTripEnd(workDate);
                  }
                }}
              />
              기간 선택
            </label>
            <p className="mt-1 text-sm text-gray-500">기본은 당일입니다. 여러 날짜에 걸친 일정이면 켜주세요.</p>

            {tripEnabled && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-sm text-gray-400">시작일</div>
                  <input
                    type="date"
                    value={tripStart}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTripStart(value);
                      if (value > tripEnd) setTripEnd(value);
                    }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-400">종료일</div>
                  <input
                    type="date"
                    value={tripEnd}
                    min={tripStart}
                    onChange={(e) => setTripEnd(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </Field>

          <Field label="내용">
            <input
              name="content"
              defaultValue={schedule?.content ?? ""}
              required
              placeholder="예) 연차(홍길동) / 주말시공(김철수) / 공지사항"
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
              {isPending ? "저장 중..." : mode === "create" ? "일정 등록" : "수정하기"}
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

export default ScheduleForm;
