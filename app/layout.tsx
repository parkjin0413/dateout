import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "강산 업무지원";
const description = "강산이엔지 업무지원 시스템 — 외근 현황, 연간 일정, 업무 보고를 한곳에서 관리하세요.";

export const metadata: Metadata = {
  metadataBase: new URL("https://kseng.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://kseng.vercel.app",
    siteName: title,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
