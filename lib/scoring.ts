import { prisma } from "./prisma";
import { clamp } from "./utils";

export type DeptScore = {
  departmentId: string;
  name: string;
  code: string;
  employeeCount: number;
  actualCO2: number;
  targetCO2: number | null;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  totalScore: number;
};

export type OrgScore = {
  overall: number;
  environmental: number;
  social: number;
  governance: number;
  departments: DeptScore[];
  weights: { wE: number; wS: number; wG: number };
  totalEmployees: number;
  totalCO2: number;
};

/** Read the single ESG config row, creating defaults if missing. */
export async function getEsgConfig() {
  let cfg = await prisma.esgConfig.findUnique({ where: { id: "singleton" } });
  if (!cfg) {
    cfg = await prisma.esgConfig.create({ data: { id: "singleton" } });
  }
  return cfg;
}

/**
 * Compute live ESG scores across all departments and the org.
 *
 * Environmental (0-100) rewards staying under the carbon goal:
 *   env = clamp(100 * (goalTarget / max(actualCO2, 1)), 0, 100)
 * averaged across a department's active goals. Departments with no goal fall
 * back to the org median environmental score.
 *
 * Social + Governance are seeded per department for this slice.
 * Department total = env*wE + soc*wS + gov*wG (weights from EsgConfig).
 * Overall = employee-count-weighted average of department totals.
 */
export async function computeOrgScore(): Promise<OrgScore> {
  const cfg = await getEsgConfig();
  const wE = cfg.weightEnvironmental;
  const wS = cfg.weightSocial;
  const wG = cfg.weightGovernance;

  const departments = await prisma.department.findMany({
    include: {
      goals: { where: { status: "Active" } },
      carbon: { select: { computedCO2: true } },
    },
    orderBy: { name: "asc" },
  });

  // First pass: env scores where a goal exists.
  const partial = departments.map((d) => {
    const actualCO2 = d.carbon.reduce((s, c) => s + c.computedCO2, 0);
    const goals = d.goals.filter((g) => g.metric.toLowerCase().includes("co2"));
    let envScore: number | null = null;
    let targetCO2: number | null = null;
    if (goals.length > 0) {
      targetCO2 = goals.reduce((s, g) => s + g.targetValue, 0) / goals.length;
      const perGoal = goals.map((g) =>
        clamp(100 * (g.targetValue / Math.max(actualCO2, 1)), 0, 100),
      );
      envScore = perGoal.reduce((s, v) => s + v, 0) / perGoal.length;
    }
    return { d, actualCO2, targetCO2, envScore };
  });

  // Org median of the known env scores, used as the fallback baseline.
  const known = partial
    .map((p) => p.envScore)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  const median =
    known.length === 0
      ? 60
      : known.length % 2
        ? known[(known.length - 1) / 2]
        : (known[known.length / 2 - 1] + known[known.length / 2]) / 2;

  const deptScores: DeptScore[] = partial.map((p) => {
    const environmentalScore = Math.round((p.envScore ?? median) * 10) / 10;
    const socialScore = Math.round(p.d.seedSocialScore * 10) / 10;
    const governanceScore = Math.round(p.d.seedGovScore * 10) / 10;
    const totalScore =
      Math.round(
        (environmentalScore * wE +
          socialScore * wS +
          governanceScore * wG) *
          10,
      ) / 10;
    return {
      departmentId: p.d.id,
      name: p.d.name,
      code: p.d.code,
      employeeCount: p.d.employeeCount,
      actualCO2: Math.round(p.actualCO2),
      targetCO2: p.targetCO2 !== null ? Math.round(p.targetCO2) : null,
      environmentalScore,
      socialScore,
      governanceScore,
      totalScore,
    };
  });

  // Employee-count-weighted org aggregation.
  const totalEmployees =
    deptScores.reduce((s, d) => s + d.employeeCount, 0) || 1;
  const wavg = (sel: (d: DeptScore) => number) =>
    Math.round(
      (deptScores.reduce((s, d) => s + sel(d) * d.employeeCount, 0) /
        totalEmployees) *
        10,
    ) / 10;

  return {
    overall: wavg((d) => d.totalScore),
    environmental: wavg((d) => d.environmentalScore),
    social: wavg((d) => d.socialScore),
    governance: wavg((d) => d.governanceScore),
    departments: deptScores.sort((a, b) => b.totalScore - a.totalScore),
    weights: { wE, wS, wG },
    totalEmployees,
    totalCO2: Math.round(deptScores.reduce((s, d) => s + d.actualCO2, 0)),
  };
}

/**
 * Persist a snapshot of the current scores to DepartmentScore (history).
 * Called after config changes so the dashboard's stored ranking stays fresh.
 */
export async function snapshotScores() {
  const org = await computeOrgScore();
  await Promise.all(
    org.departments.map((d) =>
      prisma.departmentScore.create({
        data: {
          departmentId: d.departmentId,
          environmentalScore: d.environmentalScore,
          socialScore: d.socialScore,
          governanceScore: d.governanceScore,
          totalScore: d.totalScore,
        },
      }),
    ),
  );
  return org;
}
