// Pure badge-rule evaluation, shared by the seed script and the runtime award
// engine. Rules are stored as JSON strings on Badge.unlockRule.

export type UnlockRule =
  | { type: "xp"; gte: number }
  | { type: "points"; gte: number }
  | { type: "challenges_completed"; gte: number };

export type BadgeEvalContext = {
  xp: number;
  points: number;
  challengesCompleted: number;
};

export function parseRule(raw: string): UnlockRule | null {
  try {
    return JSON.parse(raw) as UnlockRule;
  } catch {
    return null;
  }
}

/** Does the employee satisfy this unlock rule right now? */
export function satisfiesRule(rule: UnlockRule, ctx: BadgeEvalContext): boolean {
  switch (rule.type) {
    case "xp":
      return ctx.xp >= rule.gte;
    case "points":
      return ctx.points >= rule.gte;
    case "challenges_completed":
      return ctx.challengesCompleted >= rule.gte;
    default:
      return false;
  }
}

/** Human-readable requirement text for a rule. */
export function ruleLabel(rule: UnlockRule): string {
  switch (rule.type) {
    case "xp":
      return `Reach ${rule.gte.toLocaleString()} XP`;
    case "points":
      return `Earn ${rule.gte.toLocaleString()} points`;
    case "challenges_completed":
      return `Complete ${rule.gte} challenges`;
    default:
      return "Unknown";
  }
}

export const TIER_STYLE: Record<
  string,
  { ring: string; text: string; glow: string }
> = {
  Bronze: { ring: "#b45309", text: "#FFE600", glow: "#f59e0b55" },
  Silver: { ring: "#94a3b8", text: "#e2e8f0", glow: "#cbd5e155" },
  Gold: { ring: "#eab308", text: "#fde047", glow: "#facc1555" },
  Platinum: { ring: "#71717A", text: "#E7A97C", glow: "#71717A55" },
};
