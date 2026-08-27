import Link from "next/link";

import { ArrowRightIcon } from "@/components/common/icons";

type DashboardProps = {
  name: string | null;
  email: string;
  avatarUrl?: string;
  fieldTripCount: number;
  scheduleCount: number;
  hasReportToday: boolean;
  employeeCount: number;
  customerCount: number;
  expenseReportCount: number;
  leaveRequestCount: number;
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

const CustomersIcon = ({ className }: { className?: string }) => (
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
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 9.5h18" />
    <circle cx="8.5" cy="14.5" r="1.5" />
    <path d="M13 14.5h5" />
  </svg>
);

const FormIcon = ({ className }: { className?: string }) => (
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
    <path d="M6 3.5h9l3 3V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
    <path d="M9 8.5h6M9 12h4" />
    <path d="M14 17.5 15.5 16l1.5 1.5-1.5 3.5-1.5-3.5z" />
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
  scheduleCount,
  hasReportToday,
  employeeCount,
  customerCount,
  expenseReportCount,
  leaveRequestCount,
}: DashboardProps) => {
  const greetingLabel = name ? `${name}(${email})` : email;

  const tools = [
    {
      label: "외근계획표",
      description: "외근 및 현장 방문 일정을 등록하고 관리하세요.",
      href: "/field-trip",
      icon: MapPinIcon,
      badges: [{ label: `오늘 외근 ${fieldTripCount}명`, tone: "neutral" as const }],
    },
    {
      label: "연간 일정",
      description: "회사의 연간 주요 일정과 행사를 확인하세요.",
      href: "/schedule",
      icon: CalendarIcon,
      badges: [{ label: `오늘 일정 ${scheduleCount}건`, tone: "neutral" as const }],
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
    {
      label: "고객관리",
      description: "고객 정보와 연락 이력을 등록하고 관리하세요.",
      href: "/customers",
      icon: CustomersIcon,
      badges: [{ label: `등록 고객 ${customerCount}명`, tone: "neutral" as const }],
    },
    {
      label: "직원명부",
      description: "부서·직급·연락처로 동료를 찾아보세요.",
      href: "/directory",
      icon: UsersIcon,
      badges: [{ label: `등록 인원 ${employeeCount}명`, tone: "neutral" as const }],
    },
    {
      label: "양식 문서 작성",
      description: "사내 서류를 정해진 양식에 맞춰 작성하고 인쇄하세요.",
      href: "/forms",
      icon: FormIcon,
      badges: [
        { label: `지출결의서 ${expenseReportCount}건`, tone: "neutral" as const },
        { label: `연차신청서 ${leaveRequestCount}건`, tone: "neutral" as const },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-10 flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={greetingLabel}
            className="h-14 w-14 shrink-0 rounded-full border border-[#E7E2D2]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#E7E2D2] bg-white text-lg font-semibold text-[#4B4739]">
            {(name ?? email).slice(0, 1)}
          </div>
        )}
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
