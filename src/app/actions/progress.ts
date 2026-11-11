"use server";

import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { getCompletedIds, knownLessonIds, saveCompleted } from "@/lib/progressDb";

async function requireUserId(): Promise<string> {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function completeLessonAction(lessonId: string): Promise<void> {
  const userId = await requireUserId();
  await saveCompleted(userId, [lessonId]);
}

/** Merges this browser's guest progress into the account and returns everything saved. */
export async function syncProgressAction(guestIds: string[]): Promise<string[]> {
  const userId = await requireUserId();
  await saveCompleted(userId, knownLessonIds(Array.isArray(guestIds) ? guestIds : []));
  return getCompletedIds(userId);
}
