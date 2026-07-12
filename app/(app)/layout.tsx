import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/command/CommandPalette";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Real auth gate: no session -> sign in.
  if (!user) redirect("/login");

  return (
    <div className="relative flex min-h-screen">
      {/* Ambient warm orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute right-[10%] top-[15%] h-[320px] w-[320px] rounded-full bg-env/[0.04] blur-[90px] animate-float" />
        <div className="absolute bottom-[10%] left-[5%] h-[260px] w-[260px] rounded-full bg-gov/[0.05] blur-[90px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute right-[40%] top-[60%] h-[220px] w-[220px] rounded-full bg-social/[0.04] blur-[90px] animate-float" style={{ animationDelay: "5s" }} />
      </div>

      <Sidebar role={user.role} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <MobileNav role={user.role} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      {/* Global command palette (Cmd/Ctrl + K) */}
      <CommandPalette role={user.role} />
    </div>
  );
}
