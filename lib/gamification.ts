import { prisma } from "./prisma";
import { getEsgConfig } from "./scoring";
import { parseRule, satisfiesRule } from "./badges";

/**
 * Re-evaluate every badge for an employee and award any newly satisfied ones.
 * Honors EsgConfig.badgeAutoAwardEnabled. Returns the badges awarded in this
 * call so the UI can celebrate a fresh unlock.
 */
export async function awardBadges(employeeId: string) {
  const cfg = await getEsgConfig();
  if (!cfg.badgeAutoAwardEnabled) return [];

  const [employee, badges, completed, owned] = await Promise.all([
    prisma.employee.findUnique({ where: { id: employeeId } }),
    prisma.badge.findMany(),
    prisma.challengeParticipation.count({
      where: { employeeId, approval: "Approved" },
    }),
    prisma.employeeBadge.findMany({ where: { employeeId }, select: { badgeId: true } }),
  ]);
  if (!employee) return [];

  const ownedIds = new Set(owned.map((o) => o.badgeId));
  const ctx = { xp: employee.xp, points: employee.points, challengesCompleted: completed };

  const newlyAwarded: { id: string; name: string; tier: string; icon: string }[] = [];
  for (const badge of badges) {
    if (ownedIds.has(badge.id)) continue;
    const rule = parseRule(badge.unlockRule);
    if (rule && satisfiesRule(rule, ctx)) {
      await prisma.employeeBadge.create({
        data: { employeeId, badgeId: badge.id },
      });
      newlyAwarded.push({ id: badge.id, name: badge.name, tier: badge.tier, icon: badge.icon });
    }
  }
  return newlyAwarded;
}

/** Allowed lifecycle transitions for a challenge. Archive is allowed anytime. */
export const CHALLENGE_FLOW: Record<string, string[]> = {
  Draft: ["Active", "Archived"],
  Active: ["Under Review", "Completed", "Archived"],
  "Under Review": ["Completed", "Active", "Archived"],
  Completed: ["Archived"],
  Archived: ["Draft"],
};

export function canTransition(from: string, to: string): boolean {
  return (CHALLENGE_FLOW[from] ?? []).includes(to);
}
