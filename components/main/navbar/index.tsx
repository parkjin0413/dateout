"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/contexts/auth-context";
import logo from "@/public/logo2.png";

const NAV_LINKS = [
  { label: "외근계획표", href: "/field-trip" },
  { label: "연간 일정", href: "/schedule" },
  { label: "업무 보고", href: "/report" },
  { label: "인명록", href: "/directory" },
];

const MenuIcon = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-6 w-6">
    {open ? (
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
);

const Navbar = () => {
  const { user, profileName, isLoading, signOut } = useAuth();
  const name = profileName ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobileMenu = () => setMobileOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-2 items-center px-6 sm:px-8 md:grid-cols-3">
          <Link href="/" className="flex items-center gap-2.5 justify-self-start" onClick={closeMobileMenu}>
            <Image
              src={logo}
              alt="강산 업무지원"
              priority
              className="h-8 w-auto object-contain sm:h-10"
            />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold text-white sm:text-xl">강산 업무지원</span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500">
                Improvement of work
              </span>
            </span>
          </Link>

          <nav className="hidden items-center justify-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className="text-base font-medium text-gray-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-self-end gap-3">
            {isLoading ? null : user ? (
              <>
                <Link
                  href="/dashboard"
                  prefetch={false}
                  className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
                >
                  {avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={name ?? "profile"}
                      className="h-8 w-8 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="hidden flex-col items-start leading-tight sm:flex">
                    {name && <span className="text-sm font-medium text-gray-200">{name}</span>}
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-full border border-white/30 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
              >
                LOGIN
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={mobileOpen}
              className="rounded-lg p-2 text-gray-200 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </header>

      {/*
        Sibling of <header>, not nested inside it: <header> has backdrop-blur,
        and a `backdrop-filter` ancestor becomes the containing block for
        `position: fixed` descendants, which would collapse this overlay's
        height to 0 instead of the viewport.
      */}
      <div
        className="fixed inset-x-0 top-20 bottom-0 z-40 bg-black/95 backdrop-blur-xl transition-opacity duration-200 md:hidden"
        style={{ opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none" }}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              onClick={closeMobileMenu}
              className="text-2xl font-semibold text-gray-200 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
