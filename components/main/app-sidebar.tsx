"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import logo from "@/public/logo2.png";

const NAV_LINKS = [
  { label: "대시보드", href: "/dashboard", icon: "dashboard" },
  { label: "외근계획표", href: "/field-trip", icon: "trip" },
  { label: "연간 일정", href: "/schedule", icon: "calendar" },
  { label: "업무 보고", href: "/report", icon: "report" },
  { label: "직원명부", href: "/directory", icon: "directory" },
] as const;

const ADMIN_LINKS = [
  { label: "로그 관리", href: "/admin/logs", icon: "logs" },
  { label: "직원 관리", href: "/admin/employees", icon: "staff" },
] as const;

type IconKind = (typeof NAV_LINKS)[number]["icon"] | (typeof ADMIN_LINKS)[number]["icon"];

const NavIcon = ({ kind }: { kind: IconKind }) => {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "dashboard":
      return (
        <svg {...common} className="h-5 w-5">
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
          <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5" />
          <rect x="13" y="10.5" width="7.5" height="10" rx="1.5" />
          <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.5" />
        </svg>
      );
    case "trip":
      return (
        <svg {...common} className="h-5 w-5">
          <path d="M3 12l2-6h14l2 6" />
          <path d="M4 12h16v5H4z" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="16.5" cy="17.5" r="1.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common} className="h-5 w-5">
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 9.5h17" />
          <path d="M8 3v4M16 3v4" />
        </svg>
      );
    case "report":
      return (
        <svg {...common} className="h-5 w-5">
          <path d="M6 3.5h9l3 3V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
          <path d="M9 12h6M9 15.5h6M9 8.5h3" />
        </svg>
      );
    case "directory":
      return (
        <svg {...common} className="h-5 w-5">
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c.6-3 2.7-5 5.5-5s4.9 2 5.5 5" />
          <path d="M16.5 5.5c1.4.4 2.5 1.7 2.5 3.3s-1.1 2.9-2.5 3.3" />
          <path d="M18.5 14.3c1.6.5 2.9 2.1 3 4.4" />
        </svg>
      );
    case "logs":
      return (
        <svg {...common} className="h-5 w-5">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9L20 8.5V18.5A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5z" />
          <path d="M14 4v3.5A1.5 1.5 0 0 0 15.5 9H19" />
          <path d="M8 13l2 2 4-4.5" />
        </svg>
      );
    case "staff":
      return (
        <svg {...common} className="h-5 w-5">
          <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7 7 9 4.1-2 7-4.8 7-9V6z" />
          <path d="M9 12l2 2 4-4.5" />
        </svg>
      );
  }
};

type NavLink = { label: string; href: string; icon: IconKind };

const NavLinkItem = ({ link, active, onNavigate }: { link: NavLink; active: boolean; onNavigate?: () => void }) => (
  <Link
    href={link.href}
    prefetch={false}
    onClick={onNavigate}
    className={[
      "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
      active
        ? "bg-gradient-to-b from-[#16776F] to-[#0C4A45] text-white shadow-md shadow-[#0F5C56]/35"
        : "text-[#4B4739] hover:bg-[#F5F3EA]",
    ].join(" ")}
  >
    <NavIcon kind={link.icon} />
    {link.label}
  </Link>
);

const NavLinks = ({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) => {
  const { isAdmin } = useAuth();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_LINKS.map((link) => (
        <NavLinkItem key={link.href} link={link} active={pathname === link.href} onNavigate={onNavigate} />
      ))}

      {isAdmin && (
        <>
          <div className="mb-1 mt-4 px-4 text-xs font-semibold uppercase tracking-wide text-[#B9B29B]">관리자</div>
          {ADMIN_LINKS.map((link) => (
            <NavLinkItem key={link.href} link={link} active={pathname === link.href} onNavigate={onNavigate} />
          ))}
        </>
      )}
    </nav>
  );
};

const UserBlock = ({ onSignOut }: { onSignOut: () => void }) => {
  const { user, profileName } = useAuth();
  const name = profileName ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? null;

  if (!user) {
    return (
      <div className="px-3 py-4">
        <Link
          href="/auth"
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#16776F] to-[#0C4A45] px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0F5C56]/35 transition-colors hover:from-[#15746D] hover:to-[#0B3F3B]"
        >
          로그인
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 py-4">
      <div className="flex items-center gap-3 rounded-xl border border-[#E7E2D2] bg-[#FAF8F0] p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3EFEC] text-sm font-semibold text-[#0F5C56]">
          {(name ?? user.email ?? "?").slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          {name && <div className="truncate text-sm font-semibold text-[#211D14]">{name}</div>}
          <div className="truncate text-xs text-[#8A8270]">{user.email}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="mt-2 w-full rounded-xl border border-[#E7E2D2] px-3 py-2.5 text-sm font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
      >
        로그아웃
      </button>
    </div>
  );
};

const AppSidebar = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-[#F5F3EA] p-3 md:flex">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E7E2D2] bg-white shadow-xl shadow-black/[0.04]">
          <Link href="/" className="flex items-center gap-2.5 px-5 py-6">
            <Image src={logo} alt="강산 업무지원" className="h-9 w-auto shrink-0 object-contain" />
            <span className="flex flex-col leading-none">
              <span className="text-base font-bold text-[#211D14]">강산 업무지원</span>
              <span className="mt-1 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.1em] text-[#8A8270]">
                Improvement of work
              </span>
            </span>
          </Link>
          <NavLinks pathname={pathname} />
          <div className="mt-auto">
            <UserBlock onSignOut={signOut} />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed top-0 inset-x-0 z-50 flex h-16 items-center justify-between border-b border-[#E7E2D2] bg-white px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src={logo} alt="강산 업무지원" className="h-8 w-auto shrink-0 object-contain" />
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold text-[#211D14]">강산 업무지원</span>
            <span className="mt-0.5 whitespace-nowrap text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8270]">
              Improvement of work
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={mobileOpen}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-[#211D14] transition-colors hover:bg-[#F5F3EA]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-6 w-6">
            {mobileOpen ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </header>

      <div
        className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-white transition-opacity duration-200 md:hidden"
        style={{ opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none" }}
        aria-hidden={!mobileOpen}
      >
        <div className="pt-4">
          <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        </div>
        <div className="mt-auto">
          <UserBlock onSignOut={signOut} />
        </div>
      </div>
    </>
  );
};

export default AppSidebar;
