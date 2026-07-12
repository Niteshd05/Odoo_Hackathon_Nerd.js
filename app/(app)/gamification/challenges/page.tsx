import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ChallengeBoard } from "@/components/gamification/ChallengeBoard";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  const user = await getCurrentUser();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [challenges, pending, categories, activeCount, completedCount] =
    await Promise.all([
      prisma.challenge.findMany({
        include: {
          category: true,
          participations: { select: { approval: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.challengeParticipation.findMany({
        where: { approval: "Pending" },
        include: { challenge: true, employee: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.category.findMany({ where: { type: "Challenge" }, orderBy: { name: "asc" } }),
      prisma.challenge.count({ where: { status: "Active" } }),
      prisma.challengeParticipation.count({ where: { approval: "Approved" } }),
    ]);

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Gamification"
        title="Challenges"
        icon="Trophy"
        accent="#38bdf8"
        description="Run the sustainability challenge lifecycle and approve participation to award XP."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total challenges" value={challenges.length} icon="Trophy" accent="#38bdf8" />
        <StatCard label="Active" value={activeCount} icon="Flame" accent="#fbbf24" />
        <StatCard label="Pending approvals" value={pending.length} icon="ClipboardCheck" accent="#a78bfa" />
        <StatCard label="Completed runs" value={completedCount} icon="CheckCircle2" accent="#34d399" />
      </div>

      <ChallengeBoard
        canManage={canManage}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        pending={pending.map((p) => ({
          id: p.id,
          challengeTitle: p.challenge.title,
          employeeName: p.employee.name,
          employeeColor: p.employee.avatarColor,
          proof: p.proof,
          progress: p.progress,
          xp: p.challenge.xp,
          evidenceRequired: p.challenge.evidenceRequired,
        }))}
        challenges={challenges.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          xp: c.xp,
          difficulty: c.difficulty,
          status: c.status,
          evidenceRequired: c.evidenceRequired,
          deadline: c.deadline ? c.deadline.toISOString() : null,
          categoryName: c.category?.name ?? null,
          participants: c.participations.length,
          approved: c.participations.filter((p) => p.approval === "Approved").length,
        }))}
      />
    </div>
  );
}
