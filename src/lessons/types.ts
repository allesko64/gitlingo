import type { Repo } from "@/engine/types";

export interface StepContext {
  repo: Repo;
  input: string;
}

export interface LessonStep {
  instruction: string;
  hint: string;
  isDone: (ctx: StepContext) => boolean;
}

export interface Lesson {
  id: string;
  title: string;
  intro: string;
  setup: string[];
  prepare?: (repo: Repo) => Repo;
  steps: LessonStep[];
  solution: string[];
}
