import AppSidebar from "@/components/main/app-sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="light-shell min-h-screen w-full bg-[#F5F3EA]" style={{ colorScheme: "light" }}>
      <AppSidebar />
      <main className="px-4 pb-16 pt-20 sm:px-6 md:ml-60 md:px-8 md:pt-10">
        <div className="mx-auto max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
