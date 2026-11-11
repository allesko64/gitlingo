import { lessons } from "@/lessons/lessons";

export const PROGRESS_KEY = "gitlingo:progress:v1";
export const PROGRESS_EVENT = "gitlingo:progress";

export type Progress = { completed: string[] };

const KNOWN = new Set(lessons.map((lesson) => lesson.id));

export function parseProgress(raw: string | null): Progress {
  if (raw === null) {
    return { completed: [] };
  }
  try {
    const data: unknown = JSON.parse(raw);
    const list = (data as { completed?: unknown }).completed;
    if (!Array.isArray(list)) {
      return { completed: [] };
    }
    const ids = list.filter((id): id is string => typeof id === "string" && KNOWN.has(id));
    return { completed: [...new Set(ids)] };
  } catch {
    return { completed: [] };
  }
}

export function markComplete(progress: Progress, id: string): Progress {
  if (!KNOWN.has(id) || progress.completed.includes(id)) {
    return progress;
  }
  return { completed: [...progress.completed, id] };
}

export function isDone(progress: Progress, id: string): boolean {
  return progress.completed.includes(id);
}

export function isUnlocked(progress: Progress, id: string): boolean {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  if (index <= 0) {
    return index === 0;
  }
  return isDone(progress, lessons[index - 1].id);
}

export function currentLevelId(progress: Progress): string {
  return lessons.find((lesson) => !isDone(progress, lesson.id))?.id ?? lessons[lessons.length - 1].id;
}

export function nextLessonId(id: string): string | null {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  return index >= 0 && index < lessons.length - 1 ? lessons[index + 1].id : null;
}

export function levelNumber(id: string): number {
  return lessons.findIndex((lesson) => lesson.id === id) + 1;
}
