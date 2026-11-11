import { execute } from "@/engine/execute";
import { createEmptyRepo } from "@/engine/repo";
import type { Repo } from "@/engine/types";
import type { Lesson, StepContext } from "./types";

export function startRepo(lesson: Lesson): Repo {
  let repo = createEmptyRepo();

  for (const input of lesson.setup) {
    repo = execute(repo, input).repo;
  }

  return repo;
}

export function advance(lesson: Lesson, completed: number, ctx: StepContext): number {
  let next = completed;

  while (next < lesson.steps.length && lesson.steps[next].isDone(ctx)) {
    next++;
  }

  return next;
}

export function isFinished(lesson: Lesson, completed: number): boolean {
  return completed >= lesson.steps.length;
}
