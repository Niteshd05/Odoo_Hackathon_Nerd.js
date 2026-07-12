import { prisma } from "./prisma";
import { getEsgConfig } from "./scoring";

/**
 * Auto carbon calculation: for a given operation type, pick the emission factor
 * (an explicit one if provided, else the first active factor of that type) and
 * compute CO2 = quantity * factor. Honors EsgConfig.autoEmissionEnabled - when
 * off, the operation is recorded but no carbon transaction is generated.
 */
export async function createOperationWithCarbon(input: {
  type: string;
  departmentId: string;
  quantity: number;
  date?: Date;
  description?: string;
  emissionFactorId?: string;
}) {
  const cfg = await getEsgConfig();

  const op = await prisma.operationRecord.create({
    data: {
      type: input.type,
      departmentId: input.departmentId,
      quantity: input.quantity,
      date: input.date ?? new Date(),
      description: input.description,
    },
  });

  if (!cfg.autoEmissionEnabled) {
    return { operation: op, carbon: null, autoDisabled: true };
  }

  const factor = input.emissionFactorId
    ? await prisma.emissionFactor.findUnique({ where: { id: input.emissionFactorId } })
    : await prisma.emissionFactor.findFirst({
        where: { sourceType: input.type, status: "Active" },
        orderBy: { createdAt: "asc" as never },
      });

  if (!factor) {
    return { operation: op, carbon: null, autoDisabled: false, noFactor: true };
  }

  const computedCO2 = Math.round(input.quantity * factor.factor * 10) / 10;
  const carbon = await prisma.carbonTransaction.create({
    data: {
      operationRecordId: op.id,
      emissionFactorId: factor.id,
      departmentId: input.departmentId,
      quantity: input.quantity,
      computedCO2,
      date: op.date,
      auto: true,
    },
  });

  // Re-evaluate anomalies for this department now that a new point exists.
  await recomputeAnomalies(input.departmentId);

  return { operation: op, carbon, factor, autoDisabled: false };
}

/**
 * Statistical anomaly detection. Within each source type of a department,
 * flag a carbon transaction as an outlier when its CO2 is both a strong
 * z-score outlier (> 2.2 sigma) and more than 2x the group mean. Needs at
 * least 4 samples in the group to avoid false positives on thin data.
 */
export async function recomputeAnomalies(departmentId: string) {
  const txns = await prisma.carbonTransaction.findMany({
    where: { departmentId },
    include: { operationRecord: true },
  });

  // Group by operation type (fall back to factor-derived grouping).
  const groups = new Map<string, typeof txns>();
  for (const t of txns) {
    const key = t.operationRecord?.type ?? "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  for (const [, group] of groups) {
    if (group.length < 4) {
      // Not enough data - clear any stale flags.
      for (const t of group) {
        if (t.anomaly) {
          await prisma.carbonTransaction.update({
            where: { id: t.id },
            data: { anomaly: false, anomalyReason: null },
          });
        }
      }
      continue;
    }
    const values = group.map((t) => t.computedCO2);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance =
      values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance) || 1;

    for (const t of group) {
      const z = (t.computedCO2 - mean) / std;
      const isAnomaly = z > 2.2 && t.computedCO2 > mean * 2;
      const reason = isAnomaly
        ? `${(t.computedCO2 / mean).toFixed(1)}x the department mean for this source type (z=${z.toFixed(1)})`
        : null;
      if (t.anomaly !== isAnomaly || t.anomalyReason !== reason) {
        await prisma.carbonTransaction.update({
          where: { id: t.id },
          data: { anomaly: isAnomaly, anomalyReason: reason },
        });
      }
    }
  }
}

/** Emissions grouped by department for charts. */
export async function emissionsByDepartment() {
  const rows = await prisma.carbonTransaction.groupBy({
    by: ["departmentId"],
    _sum: { computedCO2: true },
  });
  const depts = await prisma.department.findMany();
  return depts
    .map((d) => ({
      code: d.code,
      name: d.name,
      value: Math.round(rows.find((r) => r.departmentId === d.id)?._sum.computedCO2 ?? 0),
    }))
    .sort((a, b) => b.value - a.value);
}

/** Emissions grouped by source type for the source-mix donut. */
export async function emissionsBySourceType() {
  const txns = await prisma.carbonTransaction.findMany({
    include: { operationRecord: true },
  });
  const map = new Map<string, number>();
  for (const t of txns) {
    const key = t.operationRecord?.type ?? "Other";
    map.set(key, (map.get(key) ?? 0) + t.computedCO2);
  }
  return Array.from(map.entries()).map(([label, value]) => ({
    label,
    value: Math.round(value),
  }));
}
