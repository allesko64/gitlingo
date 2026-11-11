import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { auth } from "./auth";

export const getSession = cache(async () => {
  await connection();
  return auth.api.getSession({ headers: await headers() });
});

export async function requireUser(returnTo: string) {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return session.user;
}

export function isAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

/** Anyone who is not an admin gets a 404, so the page does not reveal itself. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminEmail(session.user.email)) {
    notFound();
  }
  return session.user;
}
