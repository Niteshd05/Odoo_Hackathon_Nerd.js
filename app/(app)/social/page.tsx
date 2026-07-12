import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SectionTitle, StatusPill } from "@/components/ui/misc";
import { Icon } from "@/components/ui/Icon";
import { Donut } from "@/components/charts/Charts";
import { shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CAT_COLOR: Record<string, string> = {
  Environment: "#34d399",
  Education: "#38bdf8",
  Health: "#f472b6",
  Community: "#fbbf24",
  Diversity: "#a78bfa",
};

export default async function SocialPage() {
  const [activities, participationCount, hours] = await Promise.all([
    prisma.cSRActivity.findMany({
      include: { department: true, _count: { select: { participants: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.employeeParticipation.count(),
    prisma.employeeParticipation.aggregate({ _sum: { hours: true } }),
  ]);

  const byCategory = new Map<string, number>();
  for (const a of activities) {
    byCategory.set(a.category, (byCategory.get(a.category) ?? 0) + 1);
  }
  const donutData = Array.from(byCategory.entries()).map(([label, value]) => ({
    label,
    value,
    color: CAT_COLOR[label] ?? "#94a3b8",
  }));

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Social"
        title="CSR & Community"
        icon="HeartHandshake"
        accent="#38bdf8"
        description="Corporate social responsibility activity across the organization."
      />

      <div className="rounded-xl border border-social/20 bg-social/[0.06] px-4 py-2.5 text-sm text-social">
        <Icon name="Info" className="mr-1.5 inline h-4 w-4" />
        The Social pillar is a seeded, read-only slice for this demo. The full participation
        approval workflow is intentionally out of scope, so the team could go deep on the
        Environmental and Gamification flows.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="CSR activities" value={activities.length} icon="Sprout" accent="#34d399" />
        <StatCard label="Volunteer hours" value={Math.round(hours._sum.hours ?? 0)} icon="Clock" accent="#38bdf8" />
        <StatCard label="Participations" value={participationCount} icon="Users" accent="#a78bfa" />
        <StatCard label="Categories" value={donutData.length} icon="Tags" accent="#fbbf24" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <SectionTitle title="Activities" subtitle="Recent community and CSR initiatives" icon="CalendarHeart" />
          <div className="space-y-2.5">
            {activities.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${CAT_COLOR[a.category] ?? "#94a3b8"}20` }}
                >
                  <Icon name="HandHeart" className="h-5 w-5" style={{ color: CAT_COLOR[a.category] ?? "#94a3b8" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{a.title}</span>
                    <StatusPill status={a.status} />
                  </div>
                  <div className="text-xs text-slate-500">
                    {a.category} · {a.department?.name ?? "Org-wide"} · {a._count.participants} volunteers
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-medium text-social">{a.impact}</div>
                  <div className="text-xs text-slate-500">{shortDate(a.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
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
