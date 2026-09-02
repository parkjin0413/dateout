import Link from "next/link";

import { ArrowRightIcon, FieldTripIcon } from "@/components/common/icons";
import DashboardAvatar from "./avatar";

type DashboardProps = {
  name: string | null;
  email: string;
  avatarUrl?: string;
  fieldTripCount: number;
  hasReportToday: boolean;
};

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

const BADGE_TONE = {
  neutral: "border-[#CFE3E0] bg-[#E3EFEC] text-[#0F5C56]",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
} as const;

const Badge = ({ label, tone }: { label: string; tone: keyof typeof BADGE_TONE }) => (
  <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-base font-bold ${BADGE_TONE[tone]}`}>
    {label}
  </span>
);

const Dashboard = ({
  name,
  email,
  avatarUrl,
  fieldTripCount,
  hasReportToday,
}: DashboardProps) => {
  const greetingLabel = name ? `${name}(${email})` : email;

  const tools = [
    {
      label: "외근계획표",
      description: "외근 및 현장 방문 일정을 등록하고 관리하세요.",
      href: "/field-trip",
      icon: FieldTripIcon,
      badges: [{ label: `오늘 외근 ${fieldTripCount}명`, tone: "neutral" as const }],
    },
    {
      label: "업무 보고",
      description: "개별 업무 진행 상황을 작성하고 보고하세요.",
      href: "/report",
      icon: ClipboardIcon,
      badges: [
        hasReportToday
          ? { label: "오늘 작성완료", tone: "success" as const }
          : { label: "오늘 미작성", tone: "warning" as const },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-10 flex items-center gap-4">
        <DashboardAvatar avatarUrl={avatarUrl} alt={greetingLabel} fallbackText={name ?? email} />
        <div className="min-w-0">
          <p className="text-sm text-[#6B6455]">환영합니다</p>
          <h1
            className="break-words font-bold tracking-tight text-[#211D14]"
            style={{ fontSize: "clamp(1.125rem, 5.5vw, 1.875rem)" }}
          >
            {greetingLabel}님
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            prefetch={false}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E7E2D2] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#0F5C56]/40 hover:shadow-lg"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#CFE3E0] bg-[#E3EFEC] text-[#0F5C56]">
              <tool.icon className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-[#211D14]">{tool.label}</h2>
            <p className="text-sm leading-relaxed text-[#6B6455]">{tool.description}</p>
            {tool.badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tool.badges.map((badge) => (
                  <Badge key={badge.label} label={badge.label} tone={badge.tone} />
                ))}
              </div>
            )}
            <ArrowRightIcon className="absolute right-6 top-8 h-5 w-5 text-[#B9B29B] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#0F5C56]" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
