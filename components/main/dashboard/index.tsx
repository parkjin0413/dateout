import Link from "next/link";

import { ArrowRightIcon } from "@/components/common/icons";

type DashboardProps = {
  name: string | null;
  email: string;
  avatarUrl?: string;
  fieldTripCount: number;
  scheduleCount: number;
  hasReportToday: boolean;
};

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
    <path d="M9 12h6M9 16h6" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BADGE_TONE = {
  neutral: "border-purple-400/20 bg-purple-500/10 text-purple-300",
  success: "border-green-400/20 bg-green-500/10 text-green-300",
  warning: "border-amber-400/20 bg-amber-500/10 text-amber-300",
} as const;

const Badge = ({ label, tone }: { label: string; tone: keyof typeof BADGE_TONE }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${BADGE_TONE[tone]}`}>
    {label}
  </span>
);

const Dashboard = ({ name, email, avatarUrl, fieldTripCount, scheduleCount, hasReportToday }: DashboardProps) => {
  const greetingLabel = name ? `${name}(${email})` : email;

  const tools = [
    {
      label: "외근계획표",
      description: "외근 및 현장 방문 일정을 등록하고 관리하세요.",
      href: "/field-trip",
      icon: MapPinIcon,
      badge: { label: `오늘 외근 ${fieldTripCount}명`, tone: "neutral" as const },
    },
    {
      label: "연간 일정",
      description: "회사의 연간 주요 일정과 행사를 확인하세요.",
      href: "/schedule",
      icon: CalendarIcon,
      badge: { label: `오늘 일정 ${scheduleCount}건`, tone: "neutral" as const },
    },
    {
      label: "업무 보고",
      description: "개별 업무 진행 상황을 작성하고 보고하세요.",
      href: "/report",
      icon: ClipboardIcon,
      badge: hasReportToday
        ? { label: "오늘 작성완료", tone: "success" as const }
        : { label: "오늘 미작성", tone: "warning" as const },
    },
    {
      label: "인명록",
      description: "부서·직급·연락처로 동료를 찾아보세요.",
      href: "/directory",
      icon: UsersIcon,
      badge: null,
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#181818]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(168,85,247,0.08), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-32 sm:px-8">
        <div className="mb-12 flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={greetingLabel}
              className="h-14 w-14 shrink-0 rounded-full border border-white/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-gray-300">
              {(name ?? email).slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm text-gray-400">환영합니다</p>
            <h1
              className="break-words bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold tracking-tight text-transparent"
              style={{ fontSize: "clamp(1.125rem, 5.5vw, 1.875rem)" }}
            >
              {greetingLabel}님
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              prefetch={false}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-300">
                <tool.icon className="h-6 w-6" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-white">{tool.label}</h2>
              <p className="text-sm leading-relaxed text-gray-400">{tool.description}</p>
              {tool.badge && (
                <div className="mt-4">
                  <Badge label={tool.badge.label} tone={tool.badge.tone} />
                </div>
              )}
              <ArrowRightIcon className="absolute right-6 top-8 h-5 w-5 text-gray-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
