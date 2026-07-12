import { prisma } from "@/lib/prisma";
import { computeOrgScore } from "@/lib/scoring";
import { formatNumber } from "@/lib/utils";

/**
 * Grounded retrieval for the ESG Copilot. No vector DB: we pull the relevant
 * structured records via Prisma, expand sections by keyword-matching the
 * question, and assemble a compact context block where every fact carries a
 * stable record ID the model is instructed to cite (e.g. [DEPT:MFG], [TXN:...]).
 */
export async function buildEsgContext(question = ""): Promise<{
  context: string;
  recordCount: number;
}> {
  const q = question.toLowerCase();
  const wants = (keys: string[]) => keys.some((k) => q.includes(k));
  const askedEverything = question.trim().length === 0;

  const org = await computeOrgScore();
  const lines: string[] = [];
  let recordCount = 0;

  // --- Always: org + department scorecard ---
  lines.push("## ORGANIZATION SCORE");
  lines.push(
    `[ORG] Overall ESG ${org.overall} (E ${org.environmental}, S ${org.social}, G ${org.governance}). ` +
      `Weights E=${(org.weights.wE * 100).toFixed(0)}% S=${(org.weights.wS * 100).toFixed(0)}% G=${(org.weights.wG * 100).toFixed(0)}%. ` +
      `Total CO2 ${formatNumber(org.totalCO2)} kg across ${org.totalEmployees} employees.`,
  );
  recordCount++;

  lines.push("\n## DEPARTMENTS (ranked)");
  for (const d of org.departments) {
    lines.push(
      `[DEPT:${d.code}] ${d.name}: total ${d.totalScore}, env ${d.environmentalScore}, social ${d.socialScore}, gov ${d.governanceScore}. ` +
        `CO2 ${formatNumber(d.actualCO2)} kg vs goal ${d.targetCO2 ? formatNumber(d.targetCO2) + " kg" : "none"}. ` +
        `${d.targetCO2 && d.actualCO2 > d.targetCO2 ? "OVER cap." : "Under cap."} ${d.employeeCount} employees.`,
    );
    recordCount++;
  }

  // --- Environmental detail ---
  if (askedEverything || wants(["carbon", "emission", "co2", "environment", "anomaly", "outlier", "energy", "fleet", "goal"])) {
    const anomalies = await prisma.carbonTransaction.findMany({
      where: { anomaly: true },
      include: { department: true, emissionFactor: true, operationRecord: true },
      orderBy: { computedCO2: "desc" },
      take: 5,
    });
    if (anomalies.length) {
      lines.push("\n## CARBON ANOMALIES (flagged outliers)");
      for (const a of anomalies) {
        lines.push(
          `[TXN:${a.id.slice(-6)}] ${a.department.name} - ${a.operationRecord?.type ?? "operation"} via ${a.emissionFactor.name}: ` +
            `${formatNumber(a.computedCO2)} kg CO2. Reason: ${a.anomalyReason}.`,
        );
        recordCount++;
      }
    }

    const topTxns = await prisma.carbonTransaction.findMany({
      include: { department: true, operationRecord: true },
      orderBy: { computedCO2: "desc" },
      take: 6,
    });
    lines.push("\n## TOP EMITTING RECORDS");
    for (const t of topTxns) {
      lines.push(
        `[TXN:${t.id.slice(-6)}] ${t.department.name} ${t.operationRecord?.type ?? ""}: ${formatNumber(t.computedCO2)} kg CO2.`,
      );
      recordCount++;
    }

    const goals = await prisma.environmentalGoal.findMany({ include: { department: true } });
    lines.push("\n## ENVIRONMENTAL GOALS");
    for (const g of goals) {
      lines.push(`[GOAL:${g.id.slice(-6)}] ${g.department.name}: cap ${formatNumber(g.targetValue)} kg CO2 (${g.period}), status ${g.status}.`);
      recordCount++;
    }
  }

  // --- Gamification detail ---
  if (askedEverything || wants(["challenge", "badge", "reward", "xp", "point", "leaderboard", "gamif", "employee", "engagement"])) {
    const [byStatus, topEmp, pending] = await Promise.all([
      prisma.challenge.groupBy({ by: ["status"], _count: true }),
      prisma.employee.findMany({ orderBy: { xp: "desc" }, take: 3, include: { department: true } }),
      prisma.challengeParticipation.count({ where: { approval: "Pending" } }),
    ]);
    lines.push("\n## GAMIFICATION");
    lines.push(
      `[GAMI] Challenges by status: ${byStatus.map((s) => `${s.status}=${s._count}`).join(", ")}. ${pending} participations pending approval.`,
    );
    recordCount++;
    for (const e of topEmp) {
      lines.push(`[EMP:${e.id.slice(-6)}] ${e.name} (${e.department?.name ?? "-"}): ${e.xp} XP, ${e.points} points.`);
      recordCount++;
    }
  }

  // --- Governance detail ---
  if (askedEverything || wants(["governance", "policy", "policies", "audit", "compliance", "risk", "issue"])) {
    const [issues, audits] = await Promise.all([
      prisma.complianceIssue.findMany({ where: { status: { not: "Resolved" } }, include: { department: true }, orderBy: { raisedAt: "desc" }, take: 6 }),
      prisma.audit.findMany({ orderBy: { date: "desc" }, take: 4, include: { department: true } }),
    ]);
    lines.push("\n## GOVERNANCE (open issues + audits)");
    for (const i of issues) {
      lines.push(`[ISSUE:${i.id.slice(-6)}] ${i.title} - ${i.severity} severity, ${i.status} (${i.department?.name ?? "org"}).`);
      recordCount++;
    }
    for (const a of audits) {
      lines.push(`[AUDIT:${a.id.slice(-6)}] ${a.title}: ${a.result} (${a.department?.name ?? "org"}).`);
      recordCount++;
    }
  }

  // --- Social detail ---
  if (askedEverything || wants(["social", "csr", "community", "volunteer", "diversity", "donation"])) {
    const csr = await prisma.cSRActivity.findMany({ include: { _count: { select: { participants: true } } }, orderBy: { date: "desc" }, take: 5 });
    lines.push("\n## SOCIAL (CSR)");
    for (const c of csr) {
      lines.push(`[CSR:${c.id.slice(-6)}] ${c.title} (${c.category}): ${c.impact ?? "-"}, ${c._count.participants} volunteers.`);
      recordCount++;
    }
  }

  return { context: lines.join("\n"), recordCount };
}
