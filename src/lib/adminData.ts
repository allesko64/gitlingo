import { desc } from "drizzle-orm";
import { db } from "@/db";
import { progress, user } from "@/db/schema";
import { lessons } from "@/lessons/lessons";
import { currentLevelNumber, knownLessonIds } from "./progressDb";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  joined: Date;
  completed: number;
  /** 1-based level the learner is on, or null when every level is done. */
  level: number | null;
  levelTitle: string | null;
  lastActive: Date | null;
};

export type AdminData = {
  total: number;
  started: number;
  finishedAll: number;
  completions: number;
  levels: number;
  perLevel: { number: number; title: string; learners: number }[];
  users: AdminUser[];
};

export async function getAdminData(): Promise<AdminData> {
  const [users, rows] = await Promise.all([
    db.select().from(user).orderBy(desc(user.createdAt)),
    db.select().from(progress),
  ]);

  const byUser = new Map<string, { ids: string[]; last: Date | null }>();
  for (const row of rows) {
    const entry = byUser.get(row.userId) ?? { ids: [], last: null };
    entry.ids.push(row.lessonId);
    if (entry.last === null || row.completedAt > entry.last) {
      entry.last = row.completedAt;
    }
    byUser.set(row.userId, entry);
  }

  const list: AdminUser[] = users.map((person) => {
    const entry = byUser.get(person.id);
    const ids = knownLessonIds(entry?.ids ?? []);
    const level = currentLevelNumber(ids);
    return {
      id: person.id,
      name: person.name,
      email: person.email,
      joined: person.createdAt,
      completed: ids.length,
      level,
      levelTitle: level === null ? null : lessons[level - 1].title,
      lastActive: entry?.last ?? null,
    };
  });

  return {
    total: list.length,
    started: list.filter((person) => person.completed > 0).length,
    finishedAll: list.filter((person) => person.level === null).length,
    completions: list.reduce((sum, person) => sum + person.completed, 0),
    levels: lessons.length,
    perLevel: lessons.map((lesson, i) => ({
      number: i + 1,
      title: lesson.title,
      learners: list.filter((person) => (person.level ?? lessons.length + 1) === i + 1).length,
    })),
    users: list,
  };
}
