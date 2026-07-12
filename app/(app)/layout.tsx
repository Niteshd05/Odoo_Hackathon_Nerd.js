import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If the database has not been seeded yet, guide the operator instead of crashing.
  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center p-8">
        <div className="card max-w-md text-center">
          <h1 className="mb-2 text-xl font-bold text-white">
            EcoSphere needs seed data
          </h1>
          <p className="text-sm text-slate-400">
            No employees found. Run{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-env">
              npm run db:reset
            </code>{" "}
            to create the demo organization, then refresh.
          </p>
        </div>
      </div>
    );
  }

  const personas = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      title: true,
      avatarColor: true,
      department: { select: { name: true } },
    },
    orderBy: [{ role: "asc" }, { xp: "desc" }],
    take: 20,
  });

  const personaOptions = personas.map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    title: p.title,
    avatarColor: p.avatarColor,
    departmentName: p.department?.name ?? null,
  }));

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} personas={personaOptions} />
        <MobileNav role={user.role} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
        <footer className="border-t border-white/5 px-4 py-4 text-center text-[11px] text-slate-600 lg:px-8">
          EcoSphere · Built for the Odoo Hackathon ·{" "}
          <Link href="/copilot" className="text-slate-500 hover:text-env">
            Ask the ESG Copilot
          </Link>
        </footer>
      </div>
    </div>
  );
}
