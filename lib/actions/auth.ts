"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Pick-a-profile sign in. Auth here is intentionally lightweight for the demo
 * (a signed-user cookie, no passwords) - it gates access and drives role-aware
 * UI, not hard security. See docs/DECISIONS.md.
 */
export async function signInAs(userId: string) {
  const user = await prisma.employee.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, error: "That profile no longer exists." };

  cookies().set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export async function signOut() {
  cookies().delete(SESSION_COOKIE);
  redirect("/login");
}
