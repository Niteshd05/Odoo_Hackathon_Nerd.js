import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getEsgConfig, computeOrgScore } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfigForm } from "@/components/settings/ConfigForm";
import { KnowledgeGraph, type GraphNode, type GraphEdge } from "@/components/settings/KnowledgeGraph";
import { ActivityStream, type ActivityItem } from "@/components/settings/ActivityStream";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  // Role gate: only Admin/Manager may change org configuration.
  if (user && user.role === "Employee") redirect("/");

  const [config, org, departments, factors, policies, challenges, recentCarbon, recentBadges] =
    await Promise.all([
      getEsgConfig(),
      computeOrgScore(),
      prisma.department.findMany({ select: { id: true, name: true, code: true } }),
      prisma.emissionFactor.findMany({ select: { id: true, name: true } }),
      prisma.eSGPolicy.findMany({ select: { id: true, title: true, category: true } }),
      prisma.challenge.findMany({
        select: { id: true, title: true, status: true, xp: true },
        take: 10,
      }),
      prisma.carbonTransaction.findMany({
        select: {
          id: true,
          computedCO2: true,
          date: true,
          department: { select: { name: true } },
          emissionFactor: { select: { name: true } },
        },
        orderBy: { date: "desc" },
        take: 8,
      }),
      prisma.employeeBadge.findMany({
        select: {
          id: true,
          awardedAt: true,
          badge: { select: { name: true } },
          employee: { select: { name: true, avatarColor: true } },
        },
        orderBy: { awardedAt: "desc" },
        take: 4,
      }),
    ]);

  // Build knowledge graph data
  const graphNodes: GraphNode[] = [
    ...departments.map((d) => {
      const deptScore = org.departments.find((od) => od.name === d.name);
      return {
        id: `dept-${d.id}`,
        label: d.code,
        type: "department" as const,
        value: deptScore?.totalScore ?? 50,
        color: "#FFE600",
      };
    }),
    ...factors.slice(0, 8).map((f) => ({
      id: `factor-${f.id}`,
      label: f.name.length > 12 ? f.name.slice(0, 12) + "…" : f.name,
      type: "factor" as const,
      value: 30,
      color: "#A1A1AA",
    })),
    ...policies.slice(0, 6).map((p) => ({
      id: `policy-${p.id}`,
      label: p.title.length > 14 ? p.title.slice(0, 14) + "…" : p.title,
      type: "policy" as const,
      value: 25,
      color: "#71717A",
    })),
    ...challenges.slice(0, 6).map((c) => ({
      id: `challenge-${c.id}`,
      label: c.title.length > 14 ? c.title.slice(0, 14) + "…" : c.title,
      type: "challenge" as const,
      value: c.xp / 5,
      color: "#FFE600",
    })),
  ];

  const graphEdges: GraphEdge[] = [];
  // Connect departments to factors (all depts use all factors for simplicity)
  for (const d of departments) {
    for (const f of factors.slice(0, 4)) {
      graphEdges.push({ source: `dept-${d.id}`, target: `factor-${f.id}` });
    }
    // Connect departments to some policies
    for (const p of policies.slice(0, 2)) {
      graphEdges.push({ source: `dept-${d.id}`, target: `policy-${p.id}` });
    }
    // Connect departments to some challenges
    for (const c of challenges.slice(0, 2)) {
      graphEdges.push({ source: `dept-${d.id}`, target: `challenge-${c.id}` });
    }
  }

  // Build activity stream
  const activities: ActivityItem[] = [
    ...recentCarbon.map((c) => ({
      id: `carbon-${c.id}`,
      type: "carbon" as const,
      title: `${c.department?.name ?? "Unknown"} — ${c.emissionFactor?.name ?? "emission"}`,
      description: `${c.computedCO2.toFixed(1)} kg CO₂ recorded`,
      actor: "System",
      actorColor: "#94a3b8",
      timestamp: c.date,
    })),
    ...recentBadges.map((b) => ({
      id: `badge-${b.id}`,
      type: "badge" as const,
      title: `Badge awarded: ${b.badge.name}`,
      description: `Earned by ${b.employee?.name ?? "unknown"}`,
      actor: b.employee?.name ?? "System",
      actorColor: b.employee?.avatarColor ?? "#FFE600",
      timestamp: b.awardedAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="ESG Configuration"
        icon="SlidersHorizontal"
        accent="#71717A"
        description="Tune pillar weights and feature toggles. Changes recompute the org score instantly."
      />
      <ConfigForm
        initial={{
          wE: config.weightEnvironmental,
          wS: config.weightSocial,
          wG: config.weightGovernance,
          autoEmissionEnabled: config.autoEmissionEnabled,
          evidenceRequiredEnabled: config.evidenceRequiredEnabled,
          badgeAutoAwardEnabled: config.badgeAutoAwardEnabled,
        }}
        departments={org.departments.map((d) => ({
          name: d.name,
          env: d.environmentalScore,
          soc: d.socialScore,
          gov: d.governanceScore,
          employeeCount: d.employeeCount,
        }))}
      />

      {/* Admin Transparency Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <KnowledgeGraph nodes={graphNodes} edges={graphEdges} />
        <ActivityStream activities={activities} />
      </div>
    </div>
  );
}
