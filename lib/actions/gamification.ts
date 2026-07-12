"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { awardBadges, canTransition } from "@/lib/gamification";

type NewBadge = { id: string; name: string; tier: string; icon: string };
type ActionResult<T = unknown> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

function revalidateGamification() {
  revalidatePath("/gamification/challenges");
  revalidatePath("/gamification/leaderboard");
  revalidatePath("/gamification/badges");
  revalidatePath("/gamification/rewards");
  revalidatePath("/");
}

// ---------- Challenge participation ----------

/**
 * Approve a participation: award the challenge's XP and matching points to the
 * employee, then run the badge auto-award engine. Returns any newly unlocked
 * badges plus the XP delta so the client can celebrate on stage.
 */
export async function approveParticipation(
  participationId: string,
): Promise<ActionResult<{ xp: number; newBadges: NewBadge[]; employee: string }>> {
  const part = await prisma.challengeParticipation.findUnique({
    where: { id: participationId },
    include: { challenge: true, employee: true },
  });
  if (!part) return { ok: false, error: "Participation not found." };
  if (part.approval === "Approved")
    return { ok: false, error: "Already approved." };

  const xp = part.challenge.xp;

  await prisma.$transaction([
    prisma.challengeParticipation.update({
      where: { id: participationId },
      data: { approval: "Approved", xpAwarded: xp, progress: 100 },
    }),
    prisma.employee.update({
      where: { id: part.employeeId },
      // Points earned equal the XP for the slice, giving the demo a spendable balance.
      data: { xp: { increment: xp }, points: { increment: xp } },
    }),
  ]);

  const newBadges = await awardBadges(part.employeeId);

  revalidateGamification();
  return {
    ok: true,
    data: { xp, newBadges, employee: part.employee.name },
    message: `Approved. ${part.employee.name} earned ${xp} XP.`,
  };
}

export async function rejectParticipation(
  participationId: string,
): Promise<ActionResult> {
  await prisma.challengeParticipation.update({
    where: { id: participationId },
    data: { approval: "Rejected" },
  });
  revalidateGamification();
  return { ok: true, message: "Participation rejected." };
}

/** An employee joins an active challenge. */
export async function joinChallenge(
  challengeId: string,
  employeeId: string,
): Promise<ActionResult> {
  const existing = await prisma.challengeParticipation.findUnique({
    where: { challengeId_employeeId: { challengeId, employeeId } },
  });
  if (existing) return { ok: false, error: "You have already joined this challenge." };
  await prisma.challengeParticipation.create({
    data: { challengeId, employeeId, progress: 0, approval: "Pending" },
  });
  revalidateGamification();
  return { ok: true, message: "Joined the challenge." };
}

// ---------- Challenge lifecycle ----------

export async function createChallenge(input: {
  title: string;
  description: string;
  xp: number;
  difficulty: string;
  evidenceRequired: boolean;
  categoryId?: string;
  deadline?: string;
}): Promise<ActionResult> {
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  await prisma.challenge.create({
    data: {
      title: input.title.trim(),
      description: input.description,
      xp: input.xp || 100,
      difficulty: input.difficulty,
      evidenceRequired: input.evidenceRequired,
      categoryId: input.categoryId || null,
      deadline: input.deadline ? new Date(input.deadline) : null,
      status: "Draft",
    },
  });
  revalidateGamification();
  return { ok: true, message: "Challenge created as Draft." };
}

export async function transitionChallenge(
  challengeId: string,
  to: string,
): Promise<ActionResult> {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return { ok: false, error: "Challenge not found." };
  if (!canTransition(challenge.status, to))
    return { ok: false, error: `Cannot move from ${challenge.status} to ${to}.` };
  await prisma.challenge.update({ where: { id: challengeId }, data: { status: to } });
  revalidateGamification();
  return { ok: true, message: `Challenge moved to ${to}.` };
}

// ---------- Rewards ----------

/**
 * Redeem a reward: checks stock > 0 and the employee has enough points, then
 * decrements both atomically. Rejects with a clear message otherwise.
 */
export async function redeemReward(
  rewardId: string,
  employeeId: string,
): Promise<ActionResult<{ remaining: number }>> {
  const [reward, employee] = await Promise.all([
    prisma.reward.findUnique({ where: { id: rewardId } }),
    prisma.employee.findUnique({ where: { id: employeeId } }),
  ]);
  if (!reward || !employee) return { ok: false, error: "Reward or employee not found." };
  if (reward.stock <= 0) return { ok: false, error: "Out of stock." };
  if (employee.points < reward.pointsRequired)
    return {
      ok: false,
      error: `Not enough points. Need ${reward.pointsRequired}, you have ${employee.points}.`,
    };

  await prisma.$transaction([
    prisma.reward.update({ where: { id: rewardId }, data: { stock: { decrement: 1 } } }),
    prisma.employee.update({
      where: { id: employeeId },
      data: { points: { decrement: reward.pointsRequired } },
    }),
    prisma.rewardRedemption.create({
      data: { rewardId, employeeId, pointsSpent: reward.pointsRequired },
    }),
  ]);

  revalidateGamification();
  return {
    ok: true,
    data: { remaining: employee.points - reward.pointsRequired },
    message: `Redeemed ${reward.name}. ${employee.points - reward.pointsRequired} points left.`,
  };
}

export async function createReward(input: {
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Name is required." };
  await prisma.reward.create({
    data: {
      name: input.name.trim(),
      description: input.description,
      pointsRequired: input.pointsRequired,
      stock: input.stock,
    },
  });
  revalidateGamification();
  return { ok: true, message: "Reward added to the catalog." };
}
