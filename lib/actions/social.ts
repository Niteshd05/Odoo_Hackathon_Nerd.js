"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type Result = { ok: true; message?: string } | { ok: false; error: string };

function isManager(role?: string) {
  return role === "Admin" || role === "Manager";
}
function revalidate() {
  revalidatePath("/social");
  revalidatePath("/activity");
  revalidatePath("/");
}

// ---------- CSR activity CRUD (manager) ----------

export async function createCSRActivity(input: {
  title: string;
  category: string;
  departmentId?: string;
  impact?: string;
  status: string;
}): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can create activities." };
  if (!input.title.trim()) return { ok: false, error: "Title is required." };

  await prisma.cSRActivity.create({
    data: {
      title: input.title.trim(),
      category: input.category,
      departmentId: input.departmentId || null,
      impact: input.impact || null,
      status: input.status,
      date: new Date(),
    },
  });
  revalidate();
  return { ok: true, message: "CSR activity created." };
}

export async function setCSRStatus(id: string, status: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can update status." };
  await prisma.cSRActivity.update({ where: { id }, data: { status } });
  revalidate();
  return { ok: true, message: `Marked ${status}.` };
}

export async function deleteCSRActivity(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can delete." };
  await prisma.cSRActivity.delete({ where: { id } });
  revalidate();
  return { ok: true, message: "Activity removed." };
}

// ---------- Participation (any employee) ----------

export async function joinCSRActivity(activityId: string, hours: number): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const existing = await prisma.employeeParticipation.findFirst({
    where: { csrActivityId: activityId, employeeId: user.id },
  });
  if (existing) {
    await prisma.employeeParticipation.update({
      where: { id: existing.id },
      data: { hours: Math.max(0, hours) },
    });
    revalidate();
    return { ok: true, message: `Updated your hours to ${hours}.` };
  }
  await prisma.employeeParticipation.create({
    data: { csrActivityId: activityId, employeeId: user.id, hours: Math.max(0, hours) },
  });
  revalidate();
  return { ok: true, message: "You joined this activity." };
}

export async function leaveCSRActivity(activityId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  await prisma.employeeParticipation.deleteMany({
    where: { csrActivityId: activityId, employeeId: user.id },
  });
  revalidate();
  return { ok: true, message: "You left this activity." };
}
