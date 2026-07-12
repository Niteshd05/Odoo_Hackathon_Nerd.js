"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { snapshotScores } from "@/lib/scoring";

type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

/**
 * Update ESG configuration. Weights are normalized to sum to 1 so the overall
 * score stays a clean 0-100. A fresh score snapshot is taken so the dashboard
 * ranking reflects the new weighting immediately.
 */
export async function updateEsgConfig(input: {
  weightEnvironmental: number;
  weightSocial: number;
  weightGovernance: number;
  autoEmissionEnabled: boolean;
  evidenceRequiredEnabled: boolean;
  badgeAutoAwardEnabled: boolean;
}): Promise<ActionResult> {
  const sum =
    input.weightEnvironmental + input.weightSocial + input.weightGovernance;
  if (sum <= 0) return { ok: false, error: "Weights must sum to more than zero." };

  const wE = input.weightEnvironmental / sum;
  const wS = input.weightSocial / sum;
  const wG = input.weightGovernance / sum;

  await prisma.esgConfig.upsert({
    where: { id: "singleton" },
    update: {
      weightEnvironmental: wE,
      weightSocial: wS,
      weightGovernance: wG,
      autoEmissionEnabled: input.autoEmissionEnabled,
      evidenceRequiredEnabled: input.evidenceRequiredEnabled,
      badgeAutoAwardEnabled: input.badgeAutoAwardEnabled,
    },
    create: {
      id: "singleton",
      weightEnvironmental: wE,
      weightSocial: wS,
      weightGovernance: wG,
      autoEmissionEnabled: input.autoEmissionEnabled,
      evidenceRequiredEnabled: input.evidenceRequiredEnabled,
      badgeAutoAwardEnabled: input.badgeAutoAwardEnabled,
    },
  });

  await snapshotScores();

  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/environmental");
  return { ok: true, message: "ESG configuration saved. Scores recomputed." };
}
