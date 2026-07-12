import { prisma } from "./prisma";

export type MonthPoint = {
  label: string;
  month: number; // 0-11
  actual: number | null;
  projected: number | null;
};

export type DeptForecast = {
  departmentId: string;
  code: string;
  name: string;
  actualYTD: number;
  projectedYearEnd: number;
  goal: number | null;
  breachRisk: "none" | "low" | "medium" | "high";
  overBy: number; // projected - goal (can be negative)
  monthly: MonthPoint[];
  bandLow: number;
  bandHigh: number;
};

// Least-squares slope/intercept for points (x=index, y=value).
function linreg(ys: number[]): { slope: number; intercept: number; residStd: number } {
  const n = ys.length;
  if (n === 0) return { slope: 0, intercept: 0, residStd: 0 };
  const xs = ys.map((_, i) => i);
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;
  const resid = ys.map((y, i) => y - (intercept + slope * i));
  const residStd = Math.sqrt(resid.reduce((s, r) => s + r * r, 0) / n);
  return { slope, intercept, residStd };
}

/**
 * Project each department's carbon emissions to year-end using a linear trend
 * over the year's monthly totals, and compare the projection to the annual
 * goal cap. This powers the Carbon Forecast USP - "who will breach the cap".
 */
export async function forecastDepartments(): Promise<DeptForecast[]> {
  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const departments = await prisma.department.findMany({
    include: {
      goals: { where: { status: "Active" } },
      carbon: {
        where: { date: { gte: start, lt: end } },
        select: { computedCO2: true, date: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return departments
    .map((d) => {
      // Actual monthly totals for months elapsed so far.
      const monthlyActual = new Array(currentMonth + 1).fill(0);
      for (const c of d.carbon) {
        const m = new Date(c.date).getMonth();
        if (m <= currentMonth) monthlyActual[m] += c.computedCO2;
      }

      const { slope, intercept, residStd } = linreg(monthlyActual);
      const monthly: MonthPoint[] = [];
      let projectedYearEnd = 0;
      for (let m = 0; m < 12; m++) {
        if (m <= currentMonth) {
          monthly.push({ label: MONTHS[m], month: m, actual: Math.round(monthlyActual[m]), projected: null });
          projectedYearEnd += monthlyActual[m];
        } else {
          const proj = Math.max(0, intercept + slope * m);
          monthly.push({ label: MONTHS[m], month: m, actual: null, projected: Math.round(proj) });
          projectedYearEnd += proj;
        }
      }

      const actualYTD = monthlyActual.reduce((s, v) => s + v, 0);
      const goal = d.goals.find((g) => g.metric.toLowerCase().includes("co2"))?.targetValue ?? null;
      const remaining = 11 - currentMonth;
      const bandDelta = residStd * Math.sqrt(Math.max(1, remaining));

      const overBy = goal !== null ? projectedYearEnd - goal : 0;
      let breachRisk: DeptForecast["breachRisk"] = "none";
      if (goal !== null) {
        const ratio = projectedYearEnd / goal;
        if (ratio >= 1.15) breachRisk = "high";
        else if (ratio >= 1.0) breachRisk = "medium";
        else if (ratio >= 0.9) breachRisk = "low";
      }

      return {
        departmentId: d.id,
        code: d.code,
        name: d.name,
        actualYTD: Math.round(actualYTD),
        projectedYearEnd: Math.round(projectedYearEnd),
        goal: goal !== null ? Math.round(goal) : null,
        breachRisk,
        overBy: Math.round(overBy),
        monthly,
        bandLow: Math.round(Math.max(0, projectedYearEnd - bandDelta)),
        bandHigh: Math.round(projectedYearEnd + bandDelta),
      };
    })
    .sort((a, b) => b.projectedYearEnd - a.projectedYearEnd);
}
