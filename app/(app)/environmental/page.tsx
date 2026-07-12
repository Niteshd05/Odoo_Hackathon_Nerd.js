import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeOrgScore } from "@/lib/scoring";
import { emissionsByDepartment, emissionsBySourceType } from "@/lib/carbon";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SectionTitle, ProgressBar } from "@/components/ui/misc";
import { Icon } from "@/components/ui/Icon";
import { GroupedBar, Donut, TrendArea } from "@/components/charts/Charts";
import { formatCO2, formatNumber, scoreColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SOURCE_COLOR: Record<string, string> = {
  Purchase: "#5BA894",
  Manufacturing: "#9CB84A",
  Expense: "#E0A838",
  Fleet: "#CB7A4E",
  Other: "#94a3b8",
};

export default async function EnvironmentalDashboard() {
  const [org, byDept, bySource, carbon, anomalies, activeGoals] = await Promise.all([
    computeOrgScore(),
    emissionsByDepartment(),
    emissionsBySourceType(),
    prisma.carbonTransaction.findMany({ select: { computedCO2: true, date: true } }),
    prisma.carbonTransaction.count({ where: { anomaly: true } }),
    prisma.environmentalGoal.count({ where: { status: "Active" } }),
  ]);

  // Monthly trend.
  const now = new Date();
  const months: { label: string; value: number; key: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleDateString("en-US", { month: "short" }), value: 0, key: `${d.getFullYear()}-${d.getMonth()}` });
  }
  let thisMonth = 0;
  const curKey = `${now.getFullYear()}-${now.getMonth()}`;
  for (const c of carbon) {
    const d = new Date(c.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.value += c.computedCO2;
    if (key === curKey) thisMonth += c.computedCO2;
  }

  const totalCO2 = org.totalCO2;

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Environmental"
        title="Carbon Dashboard"
        icon="Leaf"
        description="Live emissions across the organization, by department, source, and time."
        actions={
          <Link href="/environmental/operations" className="btn-primary">
            <Icon name="Plus" className="h-4 w-4" />
            Add operation
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total CO2", value: formatCO2(totalCO2), icon: "Cloud", accent: "#9CB84A", hint: "all sources" },
          { label: "This month", value: formatCO2(thisMonth), icon: "CalendarDays", accent: "#5BA894" },
          { label: "Env score", value: org.environmental.toFixed(0), icon: "Gauge", accent: "#CB7A4E", hint: "org average" },
          { label: "Active goals", value: activeGoals, icon: "Target", accent: "#E0A838", hint: anomalies ? `${anomalies} anomalies` : "no anomalies" },
        ].map((stat, i) => (
          <div key={stat.label} className={`delay-${(i + 1) * 100} animate-scale-in`} style={{ animationFillMode: "both" }}>
            <StatCard {...(stat as any)} />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <SectionTitle title="Emissions by department" subtitle="Total CO2 (kg) per department" icon="BarChart3" />
          <GroupedBar
            data={byDept.map((d) => ({ label: d.code, value: d.value, color: "#9CB84A" }))}
            unit=" kg"
          />
        </div>
        <div className="card">
          <SectionTitle title="Source mix" subtitle="CO2 by operation type" icon="PieChart" />
          <Donut
            data={bySource.map((s) => ({ label: s.label, value: s.value, color: SOURCE_COLOR[s.label] ?? "#94a3b8" }))}
            centerValue={formatCO2(totalCO2)}
            centerLabel="Total"
          />
          <div className="mt-3 space-y-1.5">
            {bySource.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2 w-2 rounded-full" style={{ background: SOURCE_COLOR[s.label] ?? "#94a3b8" }} />
                  {s.label}
                </span>
                <span className="text-slate-400">{formatNumber(s.value)} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <SectionTitle title="Emissions trend" subtitle="6-month total CO2" icon="TrendingUp" />
          <TrendArea data={months.map((m) => ({ label: m.label, value: Math.round(m.value) }))} unit=" kg" />
        </div>
        <div className="card">
          <SectionTitle
            title="Department carbon vs goal"
            subtitle="Actual emissions against each cap"
            icon="Target"
            right={<Link href="/environmental/goals" className="chip hover:border-white/20">Manage goals</Link>}
          />
          <div className="space-y-3.5">
            {org.departments.map((d) => {
              const pct = d.targetCO2 ? Math.min(100, (d.actualCO2 / d.targetCO2) * 100) : 0;
              const over = d.targetCO2 ? d.actualCO2 > d.targetCO2 : false;
              return (
                <div key={d.departmentId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{d.name}</span>
                    <span className="text-xs text-slate-500">
                      {formatNumber(d.actualCO2)} / {d.targetCO2 ? formatNumber(d.targetCO2) : "-"} kg
                    </span>
                  </div>
                  <ProgressBar value={pct} accent={over ? "#f87171" : scoreColor(d.environmentalScore)} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
