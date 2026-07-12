import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { LoginCards } from "@/components/auth/LoginCards";

export const dynamic = "force-dynamic";

// One representative profile per role for the pick-a-profile sign in.
async function getProfiles() {
  const roles = ["Admin", "Manager", "Employee"];
  const picks = await Promise.all(
    roles.map((role) =>
      prisma.employee.findFirst({
        where: { role },
        include: { department: true },
        orderBy: role === "Employee" ? { xp: "asc" } : { xp: "desc" },
      }),
    ),
  );
  // Prefer Aarav (the demo hero) for the Employee card if present.
  const aarav = await prisma.employee.findFirst({
    where: { email: "aarav.sharma@ecosphere.io" },
    include: { department: true },
  });
  const list = picks.filter(Boolean) as NonNullable<(typeof picks)[number]>[];
  if (aarav) {
    const idx = list.findIndex((p) => p.role === "Employee");
    if (idx >= 0) list[idx] = aarav;
  }
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    title: p.title,
    role: p.role,
    avatarColor: p.avatarColor,
    department: p.department?.name ?? null,
  }));
}

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  const profiles = await getProfiles();

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      {/* Ambient warm blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-env/10 blur-[90px] animate-aurora-shift" />
        <div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-gov/10 blur-[90px] animate-aurora-shift" style={{ animationDelay: "6s" }} />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-social/10 blur-[90px] animate-aurora-shift" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-env to-env-deep shadow-glow">
              <Icon name="Globe2" className="h-6 w-6 text-[#0a0a0a]" />
            </div>
            <span className="font-display text-2xl font-bold text-slate-50">EcoSphere</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Sustainability, measured.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            One number, live from operational data. Choose a profile to step into the platform.
          </p>
        </div>

        <LoginCards profiles={profiles} />

        <p className="mt-8 text-center text-xs text-slate-600">
          Demo access - pick any profile to explore role-based access.
        </p>
      </div>
    </div>
  );
}
