import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { GoalManager } from "@/components/environmental/GoalManager";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const [goals, departments, carbon] = await Promise.all([
    prisma.environmentalGoal.findMany({
      include: { department: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.carbonTransaction.groupBy({
      by: ["departmentId"],
      _sum: { computedCO2: true },
    }),
  ]);

  const actualByDept = Object.fromEntries(
    carbon.map((c) => [c.departmentId, Math.round(c._sum.computedCO2 ?? 0)]),
  );

  return (
    <div className="animate-fade-up space-y-2">
      <PageHeader
        eyebrow="Environmental"
        title="Environmental Goals"
        icon="Target"
        description="Carbon caps per department. Staying under the cap drives the environmental score."
      />
      <GoalManager
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        goals={goals.map((g) => ({
          id: g.id,
          name: g.name,
          departmentName: g.department.name,
          departmentId: g.departmentId,
          targetValue: g.targetValue,
          actual: actualByDept[g.departmentId] ?? 0,
          period: g.period,
          status: g.status,
        }))}
      />
    </div>
  );
}
