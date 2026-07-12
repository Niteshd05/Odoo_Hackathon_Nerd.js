import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE = "ecosphere_uid";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string | null;
  avatarColor: string;
  xp: number;
  points: number;
  departmentId: string | null;
  departmentName: string | null;
};

/**
 * Resolve the current demo user from the session cookie. Falls back to the
 * first Admin so the app is never in a broken "logged out" state during a demo.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const uid = cookies().get(COOKIE)?.value;

  const employee = uid
    ? await prisma.employee.findUnique({
        where: { id: uid },
        include: { department: true },
      })
    : await prisma.employee.findFirst({
        where: { role: "Admin" },
        include: { department: true },
        orderBy: { createdAt: "asc" },
      });

  if (!employee) return null;

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    title: employee.title,
    avatarColor: employee.avatarColor,
    xp: employee.xp,
    points: employee.points,
    departmentId: employee.departmentId,
    departmentName: employee.department?.name ?? null,
  };
}

export const SESSION_COOKIE = COOKIE;
