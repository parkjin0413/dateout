"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";

import type { FieldTripFormState } from "@/app/field-trip/actions";
import { DEPARTMENT_OPTIONS } from "@/lib/field-trip/dept";
import type { FieldTrip } from "@/lib/field-trip/types";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "30"];

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white outline-none transition-colors focus:border-purple-400/50";

type Props = {
  mode: "create" | "edit";
  action: (state: FieldTripFormState, formData: FormData) => Promise<FieldTripFormState>;
  workDate: string;
  trip?: FieldTrip;
  defaultAuthorName: string;
  isAdmin: boolean;
};

const splitTime = (value?: string) => {
  const m = value?.match(/^(\d{2}):(\d{2})$/);
  return m ? { h: m[1], m: m[2] } : { h: "", m: "" };
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-base font-medium text-gray-300">{label}</label>
    {children}
  </div>
);

const TimeSelect = ({
  hour,
  minute,
  onChange,
}: {
  hour: string;
  minute: string;
  onChange: (hour: string, minute: string) => void;
}) => (
  <div className="flex gap-2">
    <select value={hour} onChange={(e) => onChange(e.target.value, minute)} className={inputCls}>
      <option value="">시</option>
      {HOURS.map((h) => (
        <option key={h} value={h}>
          {h}
        </option>
      ))}
    </select>
    <select value={minute} onChange={(e) => onChange(hour, e.target.value)} className={inputCls}>
      <option value="">분</option>
      {MINUTES.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  </div>
);

const TripForm = ({ mode, action, workDate, trip, defaultAuthorName, isAdmin }: Props) => {
  const [state, formAction, isPending] = useActionState(action, null);

  const initialDepart = splitTime(trip?.depart_time);
  const initialReturn = splitTime(trip?.return_time);

  const [departH, setDepartH] = useState(initialDepart.h);
  const [departM, setDepartM] = useState(initialDepart.m);
  const [returnH, setReturnH] = useState(initialReturn.h);
  const [returnM, setReturnM] = useState(initialReturn.m);

  const [tripEnabled, setTripEnabled] = useState(!!trip && trip.trip_start !== trip.trip_end);
  const [tripStart, setTripStart] = useState(trip?.trip_start ?? workDate);
  const [tripEnd, setTripEnd] = useState(trip?.trip_end ?? workDate);

  const departTime = departH && departM ? `${departH}:${departM}` : "";
  const returnTime = returnH && returnM ? `${returnH}:${returnM}` : "";

  const listHref = `/field-trip?date=${workDate}&ym=${workDate.slice(0, 7)}`;

  return (
    <div className="relative min-h-screen w-full bg-[#181818]">
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-32 sm:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{mode === "create" ? "외근 입력" : "외근 수정"}</h1>
          <p className="mt-1 text-base text-gray-400">기준일 {workDate}</p>
        </div>

        <form action={formAction} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <input type="hidden" name="base_date" value={workDate} />
          <input type="hidden" name="trip_enabled" value={tripEnabled ? "on" : ""} />
          <input type="hidden" name="trip_start" value={tripEnabled ? tripStart : workDate} />
          <input type="hidden" name="trip_end" value={tripEnabled ? tripEnd : workDate} />
          <input type="hidden" name="depart_time" value={departTime} />
          <input type="hidden" name="return_time" value={returnTime} />

          <Field label="성명">
            {isAdmin ? (
              <>
                <input name="author_name" defaultValue={defaultAuthorName} required className={inputCls} />
                <p className="mt-1 text-sm text-gray-500">관리자만 성명 수정이 가능합니다.</p>
              </>
            ) : (
              <div className="py-2 text-base font-medium text-white">{defaultAuthorName}</div>
            )}
          </Field>

          <Field label="부서">
            <select name="department" defaultValue={trip?.department ?? ""} required className={inputCls}>
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

          <Field label="출장(기간)">
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
            <p className="mt-1 text-sm text-gray-500">
              기본은 당일 외근입니다. 여러 날짜에 걸친 출장일 때만 켜주세요.
            </p>

            {tripEnabled && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-sm text-gray-400">출발일</div>
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
                  <div className="mb-1 text-sm text-gray-400">도착일</div>
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

          <Field label="행선지">
            <input
              name="destination"
              defaultValue={trip?.destination ?? ""}
              placeholder="예) 포천, 부산, 평택"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="출발시간">
              <TimeSelect
                hour={departH}
                minute={departM}
                onChange={(h, m) => {
                  setDepartH(h);
                  setDepartM(m);
                }}
              />
            </Field>
            <Field label="복귀시간">
              <TimeSelect
                hour={returnH}
                minute={returnM}
                onChange={(h, m) => {
                  setReturnH(h);
                  setReturnM(m);
                }}
              />
            </Field>
          </div>

          <Field label="비고">
            <div className="space-y-2">
              <input
                name="remark_1"
                defaultValue={trip?.remark_1 ?? ""}
                placeholder="예) 홍익대학교"
                className={inputCls}
              />
              <input
                name="remark_2"
                defaultValue={trip?.remark_2 ?? ""}
                placeholder="예) 일성중고등학교"
                className={inputCls}
              />
              <input
                name="remark_3"
                defaultValue={trip?.remark_3 ?? ""}
                placeholder="예) 신수동주민센터"
                className={inputCls}
              />
              <input
                name="remark_4"
                defaultValue={trip?.remark_4 ?? ""}
                placeholder="예) 추가 방문지 또는 참고사항"
                className={inputCls}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              사무실 복귀·재출발이 있는 경우, 장소명 뒤에 (복귀 12:00) 또는 (출발 15:00)처럼 표시해 주세요.
            </p>
          </Field>

          {state?.error && <p className="text-base text-red-400">{state.error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-white px-5 py-2.5 text-base font-semibold text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "저장 중..." : mode === "create" ? "외근 입력" : "수정하기"}
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

export default TripForm;
