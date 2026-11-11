import { eq } from "drizzle-orm";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { lessons } from "@/lessons/lessons";

const ORDER = lessons.map((lesson) => lesson.id);

export function knownLessonIds(ids: readonly unknown[]): string[] {
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && ORDER.includes(id)))];
}

export async function getCompletedIds(userId: string): Promise<string[]> {
  const rows = await db.select({ lessonId: progress.lessonId }).from(progress).where(eq(progress.userId, userId));
  return knownLessonIds(rows.map((row) => row.lessonId));
}

export async function saveCompleted(userId: string, ids: string[]): Promise<void> {
  const valid = knownLessonIds(ids);
  if (valid.length === 0) {
    return;
  }
  await db
    .insert(progress)
    .values(valid.map((lessonId) => ({ userId, lessonId })))
    .onConflictDoNothing();
}

/** The first level the learner has not finished, as a 1-based number. null when all are done. */
export function currentLevelNumber(completed: readonly string[]): number | null {
  const index = ORDER.findIndex((id) => !completed.includes(id));
  return index === -1 ? null : index + 1;
}
