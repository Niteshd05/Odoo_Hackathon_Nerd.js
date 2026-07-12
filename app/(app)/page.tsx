import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeOrgScore } from "@/lib/scoring";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SectionTitle } from "@/components/ui/misc";
import { Icon } from "@/components/ui/Icon";
import { RankBar, TrendArea, Donut } from "@/components/charts/Charts";
import { formatCO2, formatNumber, scoreColor, scoreGrade } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const org = await computeOrgScore();

  const [pendingApprovals, anomalies, activeChallenges, employeeCount, carbon] =
    await Promise.all([
      prisma.challengeParticipation.count({ where: { approval: "Pending" } }),
      prisma.carbonTransaction.findMany({
        where: { anomaly: true },
        include: { department: true, emissionFactor: true },
        orderBy: { computedCO2: "desc" },
        take: 1,
      }),
      prisma.challenge.count({ where: { status: "Active" } }),
      prisma.employee.count(),
      prisma.carbonTransaction.findMany({ select: { computedCO2: true, date: true } }),
    ]);

  // Monthly emissions trend (last 6 months).
  const now = new Date();
  const months: { label: string; value: number; key: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      value: 0,
      key: `${d.getFullYear()}-${d.getMonth()}`,
    });
  }
  for (const c of carbon) {
    const d = new Date(c.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.value += c.computedCO2;
  }

  return {
    org,
    pendingApprovals,
    anomaly: anomalies[0] ?? null,
    activeChallenges,
    employeeCount,
    trend: months.map((m) => ({ label: m.label, value: Math.round(m.value) })),
  };
}

export default async function DashboardPage() {
  const { org, pendingApprovals, anomaly, activeChallenges, employeeCount, trend } =
    await getDashboardData();

  const pillarDonut = [
    { label: "Environmental", value: org.environmental, color: "#FFE600" },
    { label: "Social", value: org.social, color: "#A1A1AA" },
    { label: "Governance", value: org.governance, color: "#71717A" },
  ];
  const deptRank = org.departments.map((d) => ({
    label: d.code,
    value: d.totalScore,
    color: scoreColor(d.totalScore),
  }));

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="EcoSphere Dashboard"
        description="Your live ESG performance overview and pending action items."
        icon="LayoutDashboard"
      />

      {/* Anomaly alert */}
      {anomaly && (
        <Link
          href="/environmental/carbon"
          className="flex items-center gap-3 rounded-2xl border border-red-400/25 bg-red-400/[0.07] px-4 py-3 transition hover:bg-red-400/10"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-400/15">
            <Icon name="AlertTriangle" className="h-4 w-4 text-red-400" />
          </div>
          <div className="flex-1 text-sm">
            <span className="font-semibold text-red-300">Carbon anomaly detected</span>
            <span className="text-slate-400">
              {" "}· {anomaly.department.name} emitted {formatCO2(anomaly.computedCO2)} on one{" "}
              {anomaly.emissionFactor.name} record. {anomaly.anomalyReason}
            </span>
          </div>
          <Icon name="ChevronRight" className="h-4 w-4 text-slate-500" />
        </Link>
      )}

      {/* Hero: score ring + pillar + stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center justify-center gap-2 lg:col-span-1">
          <ScoreRing score={org.overall} />
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <Icon name="Users" className="h-3.5 w-3.5" />
            Weighted across {employeeCount} employees, {org.departments.length} departments
          </div>
        </div>

        <div className="card lg:col-span-1">
          <SectionTitle title="Pillar breakdown" subtitle="E / S / G contribution" icon="PieChart" />
          <Donut
            data={pillarDonut}
            centerValue={org.overall.toFixed(0)}
            centerLabel="ESG"
          />
          <div className="mt-3 space-y-2">
            {pillarDonut.map((p) => (
              <div key={p.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </span>
                <span className="font-semibold text-fg">{p.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-1">
          <StatCard label="Environmental" value={org.environmental.toFixed(0)} icon="Leaf" accent="#FFE600" hint={scoreGrade(org.environmental).label} />
          <StatCard label="Social" value={org.social.toFixed(0)} icon="HeartHandshake" accent="#A1A1AA" hint={scoreGrade(org.social).label} />
          <StatCard label="Governance" value={org.governance.toFixed(0)} icon="Scale" accent="#71717A" hint={scoreGrade(org.governance).label} />
          <StatCard label="Total CO2" value={formatCO2(org.totalCO2)} icon="Factory" accent="#FFE600" hint="all sources" />
        </div>
      </div>

      {/* Department ranking + trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <SectionTitle
            title="Department ranking"
            subtitle="Total ESG score by department"
            icon="Trophy"
            right={
              <Link href="/settings" className="chip hover:border-line/20">
                <Icon name="SlidersHorizontal" className="h-3 w-3" />
                Weights
              </Link>
            }
          />
          <RankBar data={deptRank} />
        </div>
        <div className="card">
          <SectionTitle title="Emissions trend" subtitle="Total CO2 over the last 6 months" icon="TrendingUp" />
          <TrendArea data={trend} unit=" kg" />
        </div>
      </div>

      {/* Quick actions row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction href="/gamification/challenges" icon="Trophy" accent="#A1A1AA" title="Approvals waiting" value={`${pendingApprovals} pending`} />
        <QuickAction href="/gamification/challenges" icon="Zap" accent="#FFE600" title="Active challenges" value={`${activeChallenges} running`} />
        <QuickAction href="/environmental" icon="Leaf" accent="#FFE600" title="Carbon dashboard" value="Live tracking" />
        <QuickAction href="/copilot" icon="Sparkles" accent="#71717A" title="ESG Copilot" value="Ask anything" />
      </div>

      {/* Department table */}
      <div className="card">
        <SectionTitle title="Department scorecard" subtitle="Live pillar scores and carbon vs goal" icon="Building2" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 text-right font-medium">Env</th>
                <th className="pb-3 text-right font-medium">Social</th>
                <th className="pb-3 text-right font-medium">Gov</th>
                <th className="pb-3 text-right font-medium">CO2 / Goal</th>
                <th className="pb-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {org.departments.map((d) => {
                const grade = scoreGrade(d.totalScore);
                return (
                  <tr key={d.departmentId} className="table-row">
                    <td className="py-3">
                      <div className="font-medium text-fg">{d.name}</div>
                      <div className="text-xs text-slate-500">{d.employeeCount} employees</div>
                    </td>
                    <td className="py-3 text-right font-medium text-env">{d.environmentalScore.toFixed(0)}</td>
                    <td className="py-3 text-right font-medium text-social">{d.socialScore.toFixed(0)}</td>
                    <td className="py-3 text-right font-medium text-gov">{d.governanceScore.toFixed(0)}</td>
                    <td className="py-3 text-right text-slate-400">
                      {formatNumber(d.actualCO2)}
                      <span className="text-slate-600"> / {d.targetCO2 ? formatNumber(d.targetCO2) : "-"}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-bold"
                        style={{ background: `${scoreColor(d.totalScore)}18`, color: scoreColor(d.totalScore) }}
                      >
                        {d.totalScore.toFixed(1)}
                        <span className="text-[10px] opacity-70">{grade.grade}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  accent,
  title,
  value,
}: {
  href: string;
  icon: string;
  accent: string;
  title: string;
  value: string;
}) {
  return (
    <Link href={href} className="card glass-hover group flex items-center gap-3">
      <div
        className="grid h-11 w-11 place-items-center rounded-xl border border-line/10"
        style={{ background: `${accent}18` }}
      >
        <Icon name={icon} className="h-5 w-5" style={{ color: accent }} />
      </div>
      <div className="flex-1">
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-sm font-semibold text-fg">{value}</div>
      </div>
      <Icon name="ArrowUpRight" className="h-4 w-4 text-slate-600 transition group-hover:text-slate-300" />
    </Link>
  );
}
