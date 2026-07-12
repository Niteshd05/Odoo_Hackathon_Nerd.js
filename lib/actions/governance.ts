"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type Result = { ok: true; message?: string } | { ok: false; error: string };

const isManager = (role?: string) => role === "Admin" || role === "Manager";
function revalidate() {
  revalidatePath("/governance");
  revalidatePath("/");
}

// ---------- Policies ----------

export async function createPolicy(input: {
  title: string;
  body: string;
  category: string;
  status: string;
}): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can create policies." };
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  await prisma.eSGPolicy.create({
    data: {
      title: input.title.trim(),
      body: input.body,
      category: input.category,
      status: input.status,
    },
  });
  revalidate();
  return { ok: true, message: "Policy created." };
}

export async function setPolicyStatus(id: string, status: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can change status." };
  await prisma.eSGPolicy.update({ where: { id }, data: { status } });
  revalidate();
  return { ok: true, message: `Policy ${status.toLowerCase()}.` };
}

export async function deletePolicy(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can delete." };
  await prisma.eSGPolicy.delete({ where: { id } });
  revalidate();
  return { ok: true, message: "Policy removed." };
}

/** Any signed-in user can acknowledge a published policy (idempotent). */
export async function acknowledgePolicy(policyId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const existing = await prisma.policyAcknowledgement.findFirst({
    where: { policyId, employeeId: user.id },
  });
  if (existing) return { ok: true, message: "Already acknowledged." };
  await prisma.policyAcknowledgement.create({ data: { policyId, employeeId: user.id } });
  revalidate();
  return { ok: true, message: "Policy acknowledged." };
}

// ---------- Audits ----------

export async function createAudit(input: {
  title: string;
  type: string;
  result: string;
  departmentId?: string;
  notes?: string;
}): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can log audits." };
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  await prisma.audit.create({
    data: {
      title: input.title.trim(),
      type: input.type,
      result: input.result,
      departmentId: input.departmentId || null,
      notes: input.notes || null,
      date: new Date(),
    },
  });
  revalidate();
  return { ok: true, message: "Audit logged." };
}

export async function deleteAudit(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can delete." };
  await prisma.audit.delete({ where: { id } });
  revalidate();
  return { ok: true, message: "Audit removed." };
}

// ---------- Compliance issues ----------

export async function createIssue(input: {
  title: string;
  severity: string;
  departmentId?: string;
}): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can raise issues." };
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  await prisma.complianceIssue.create({
    data: {
      title: input.title.trim(),
      severity: input.severity,
      departmentId: input.departmentId || null,
      status: "Open",
      raisedAt: new Date(),
    },
  });
  revalidate();
  return { ok: true, message: "Compliance issue raised." };
}

export async function setIssueStatus(id: string, status: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can update issues." };
  await prisma.complianceIssue.update({ where: { id }, data: { status } });
  revalidate();
  return { ok: true, message: `Issue marked ${status}.` };
}

export async function deleteIssue(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!isManager(user?.role)) return { ok: false, error: "Only managers can delete." };
  await prisma.complianceIssue.delete({ where: { id } });
  revalidate();
  return { ok: true, message: "Issue removed." };
}
