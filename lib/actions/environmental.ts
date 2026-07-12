"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createOperationWithCarbon } from "@/lib/carbon";

type ActionResult<T = unknown> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

// ---------- Operation records (the live demo action) ----------

export async function addOperationRecord(input: {
  type: string;
  departmentId: string;
  quantity: number;
  description?: string;
  emissionFactorId?: string;
  date?: string;
}): Promise<ActionResult<{ co2: number | null }>> {
  if (!input.departmentId) return { ok: false, error: "Pick a department." };
  if (!input.quantity || input.quantity <= 0)
    return { ok: false, error: "Quantity must be greater than zero." };

  const result = await createOperationWithCarbon({
    type: input.type,
    departmentId: input.departmentId,
    quantity: input.quantity,
    description: input.description,
    emissionFactorId: input.emissionFactorId || undefined,
    date: input.date ? new Date(input.date) : undefined,
  });

  revalidatePath("/environmental");
  revalidatePath("/environmental/operations");
  revalidatePath("/environmental/carbon");
  revalidatePath("/");

  if (result.autoDisabled)
    return { ok: true, data: { co2: null }, message: "Operation saved. Auto emission calc is off." };
  if ("noFactor" in result && result.noFactor)
    return { ok: true, data: { co2: null }, message: "Operation saved, but no emission factor matched this type." };

  return {
    ok: true,
    data: { co2: result.carbon?.computedCO2 ?? null },
    message: `Carbon transaction auto-created: ${result.carbon?.computedCO2} kg CO2.`,
  };
}

// ---------- Emission factor CRUD ----------

export async function createEmissionFactor(input: {
  name: string;
  unit: string;
  factor: number;
  sourceType: string;
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Name is required." };
  if (!input.factor || input.factor <= 0)
    return { ok: false, error: "Factor must be greater than zero." };
  await prisma.emissionFactor.create({ data: { ...input, name: input.name.trim() } });
  revalidatePath("/environmental/factors");
  return { ok: true, message: "Emission factor created." };
}

export async function updateEmissionFactor(
  id: string,
  input: { name: string; unit: string; factor: number; sourceType: string },
): Promise<ActionResult> {
  await prisma.emissionFactor.update({ where: { id }, data: input });
  revalidatePath("/environmental/factors");
  return { ok: true, message: "Emission factor updated." };
}

export async function toggleEmissionFactor(id: string): Promise<ActionResult> {
  const f = await prisma.emissionFactor.findUnique({ where: { id } });
  if (!f) return { ok: false, error: "Not found." };
  await prisma.emissionFactor.update({
    where: { id },
    data: { status: f.status === "Active" ? "Inactive" : "Active" },
  });
  revalidatePath("/environmental/factors");
  return { ok: true, message: "Status updated." };
}

export async function deleteEmissionFactor(id: string): Promise<ActionResult> {
  const used = await prisma.carbonTransaction.count({ where: { emissionFactorId: id } });
  if (used > 0)
    return { ok: false, error: `In use by ${used} carbon transactions - set inactive instead.` };
  await prisma.emissionFactor.delete({ where: { id } });
  revalidatePath("/environmental/factors");
  return { ok: true, message: "Emission factor deleted." };
}

// ---------- Environmental goals ----------

export async function createGoal(input: {
  name: string;
  departmentId: string;
  targetValue: number;
  period: string;
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Name is required." };
  if (!input.departmentId) return { ok: false, error: "Pick a department." };
  if (!input.targetValue || input.targetValue <= 0)
    return { ok: false, error: "Target must be greater than zero." };
  await prisma.environmentalGoal.create({
    data: {
      name: input.name.trim(),
      departmentId: input.departmentId,
      targetValue: input.targetValue,
      period: input.period || "2026",
      metric: "Total CO2 (kg)",
    },
  });
  revalidatePath("/environmental/goals");
  revalidatePath("/environmental");
  revalidatePath("/");
  return { ok: true, message: "Goal created." };
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  await prisma.environmentalGoal.delete({ where: { id } });
  revalidatePath("/environmental/goals");
  revalidatePath("/");
  return { ok: true, message: "Goal removed." };
}
