import Image from "next/image";
import Link from "next/link";

import logo from "@/public/logo.png";

const NAV_LINKS = [
  { label: "외근계획표", href: "/field-trip" },
  { label: "연간 일정", href: "/schedule" },
  { label: "업무 보고", href: "/report" },
];

const Navbar = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-2 items-center px-6 sm:px-8 md:grid-cols-3">
        <Link href="/" className="justify-self-start">
          <Image src={logo} alt="KANGSAN WORK" priority className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center justify-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="justify-self-end rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
        >
          LOGIN
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
