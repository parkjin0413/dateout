import Link from "next/link";

import { ArrowRightIcon } from "@/components/common/icons";

type DashboardProps = {
  name: string;
  avatarUrl?: string;
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

const TOOLS = [
  {
    label: "외근계획표",
    description: "외근 및 현장 방문 일정을 등록하고 관리하세요.",
    href: "/field-trip",
    icon: MapPinIcon,
  },
  {
    label: "연간 일정",
    description: "회사의 연간 주요 일정과 행사를 확인하세요.",
    href: "/schedule",
    icon: CalendarIcon,
  },
  {
    label: "업무 보고",
    description: "개별 업무 진행 상황을 작성하고 보고하세요.",
    href: "/report",
    icon: ClipboardIcon,
  },
];

const Dashboard = ({ name, avatarUrl }: DashboardProps) => {
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
              alt={name}
              className="h-14 w-14 rounded-full border border-white/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-gray-300">
              {name.slice(0, 1)}
            </div>
          )}
          <div>
            <p className="text-sm text-gray-400">환영합니다</p>
            <h1 className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
              {name}님
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-300">
                <tool.icon className="h-6 w-6" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-white">{tool.label}</h2>
              <p className="text-sm leading-relaxed text-gray-400">{tool.description}</p>
              <ArrowRightIcon className="absolute right-6 top-8 h-5 w-5 text-gray-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
