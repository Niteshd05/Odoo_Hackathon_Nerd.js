import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SectionTitle } from "@/components/ui/misc";
import { Donut } from "@/components/charts/Charts";
import { SocialBoard, type SocialActivity } from "@/components/social/SocialBoard";

export const dynamic = "force-dynamic";

const CAT_COLOR: Record<string, string> = {
  Environment: "#FFE600",
  Education: "#60A5FA",
  Health: "#F472B6",
  Community: "#34D399",
  Diversity: "#A855F7",
};

export default async function SocialPage() {
  const user = await getCurrentUser();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [activities, departments, participationCount, hours] = await Promise.all([
    prisma.cSRActivity.findMany({
      include: { department: true, participants: { include: { employee: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.employeeParticipation.count(),
    prisma.employeeParticipation.aggregate({ _sum: { hours: true } }),
  ]);

  const byCategory = new Map<string, number>();
  for (const a of activities) byCategory.set(a.category, (byCategory.get(a.category) ?? 0) + 1);
  const donutData = Array.from(byCategory.entries()).map(([label, value]) => ({
    label,
    value,
    color: CAT_COLOR[label] ?? "#A1A1AA",
  }));

  const board: SocialActivity[] = activities.map((a) => {
    const parts = a.participants.map((p) => ({
      id: p.employee.id,
      name: p.employee.name,
      color: p.employee.avatarColor,
      hours: p.hours,
    }));
    const mine = a.participants.find((p) => p.employeeId === user?.id);
    return {
      id: a.id,
      title: a.title,
      category: a.category,
      department: a.department?.name ?? null,
      impact: a.impact,
      status: a.status,
      date: a.date.toISOString(),
      participants: parts,
      totalHours: parts.reduce((s, p) => s + p.hours, 0),
      joined: !!mine,
      myHours: mine?.hours ?? 0,
    };
  });

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Social"
        title="CSR & Community"
        icon="HeartHandshake"
        accent="#A1A1AA"
        description="Launch initiatives, volunteer, and log hours. Fully interactive across the organization."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="CSR activities" value={activities.length} icon="Sprout" accent="#FFE600" />
        <StatCard label="Volunteer hours" value={Math.round(hours._sum.hours ?? 0)} icon="Clock" accent="#60A5FA" />
        <StatCard label="Participations" value={participationCount} icon="Users" accent="#A855F7" />
        <StatCard label="Categories" value={donutData.length} icon="Tags" accent="#34D399" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <SocialBoard
            activities={board}
            departments={departments.map((d) => ({ id: d.id, name: d.name }))}
            canManage={canManage}
          />
        </div>
        <div className="card h-fit">
          <SectionTitle title="Activity mix" subtitle="By category" icon="PieChart" />
          <Donut data={donutData} centerValue={String(activities.length)} centerLabel="Activities" />
          <div className="mt-3 space-y-1.5">
            {donutData.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  {d.label}
                </span>
                <span className="text-slate-400">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
