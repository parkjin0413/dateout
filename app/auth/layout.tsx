import AppShell from "@/components/main/app-shell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
