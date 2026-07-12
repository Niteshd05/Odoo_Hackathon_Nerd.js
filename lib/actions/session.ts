"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Switch the active demo persona. Auth in this build is intentionally light
 * (a seeded-user cookie) - it gates nav visibility and attribution, not real
 * security. See DECISIONS.md.
 */
export async function switchPersona(userId: string) {
  cookies().set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/", "layout");
}
