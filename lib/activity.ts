import { prisma } from "./prisma";

export type ActivityEvent = {
  id: string;
  kind: "badge" | "reward" | "challenge" | "operation" | "anomaly" | "launch";
  icon: string;
  color: string;
  actor: string | null;
  actorColor: string | null;
  text: string; // may contain **bold** segments
  at: string; // ISO
};

/**
 * Unified org activity stream, aggregated from recent records across modules.
 * Powers the Live Activity Feed USP - a real-time pulse of the organization.
 */
export async function getActivityFeed(limit = 40): Promise<ActivityEvent[]> {
  const [badges, redemptions, approvals, operations, anomalies, launches] = await Promise.all([
    prisma.employeeBadge.findMany({
      include: { employee: true, badge: true },
      orderBy: { awardedAt: "desc" },
      take: 15,
    }),
    prisma.rewardRedemption.findMany({
      include: { employee: true, reward: true },
      orderBy: { date: "desc" },
      take: 15,
    }),
    prisma.challengeParticipation.findMany({
      where: { approval: "Approved" },
      include: { employee: true, challenge: true },
      orderBy: { updatedAt: "desc" },
      take: 15,
    }),
    prisma.operationRecord.findMany({
      include: { department: true },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.carbonTransaction.findMany({
      where: { anomaly: true },
      include: { department: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.challenge.findMany({
      where: { status: { in: ["Active", "Under Review"] } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const events: ActivityEvent[] = [
    ...badges.map((b) => ({
      id: `badge-${b.id}`,
      kind: "badge" as const,
      icon: "Award",
      color: "#FFE600",
      actor: b.employee.name,
      actorColor: b.employee.avatarColor,
      text: `unlocked the **${b.badge.name}** badge`,
      at: b.awardedAt.toISOString(),
    })),
    ...redemptions.map((r) => ({
      id: `reward-${r.id}`,
      kind: "reward" as const,
      icon: "Gift",
      color: "#FFE600",
      actor: r.employee.name,
      actorColor: r.employee.avatarColor,
      text: `redeemed **${r.reward.name}** for ${r.pointsSpent} pts`,
      at: r.date.toISOString(),
    })),
    ...approvals.map((a) => ({
      id: `appr-${a.id}`,
      kind: "challenge" as const,
      icon: "CircleCheck",
      color: "#A1A1AA",
      actor: a.employee.name,
      actorColor: a.employee.avatarColor,
      text: `completed **${a.challenge.title}** (+${a.xpAwarded} XP)`,
      at: a.updatedAt.toISOString(),
    })),
    ...operations.map((o) => ({
      id: `op-${o.id}`,
      kind: "operation" as const,
      icon: "Factory",
      color: "#93CDBD",
      actor: null,
      actorColor: null,
      text: `New **${o.type}** operation logged in ${o.department.name}`,
      at: o.createdAt.toISOString(),
    })),
    ...anomalies.map((x) => ({
      id: `anom-${x.id}`,
      kind: "anomaly" as const,
      icon: "TriangleAlert",
      color: "#FF5C4A",
      actor: null,
      actorColor: null,
      text: `Carbon anomaly flagged in **${x.department.name}** (${Math.round(x.computedCO2).toLocaleString()} kg)`,
      at: x.createdAt.toISOString(),
    })),
    ...launches.map((c) => ({
      id: `launch-${c.id}`,
      kind: "launch" as const,
      icon: "Rocket",
      color: "#71717A",
      actor: null,
      actorColor: null,
      text: `Challenge **${c.title}** is ${c.status.toLowerCase()}`,
      at: c.createdAt.toISOString(),
    })),
  ];

  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}
