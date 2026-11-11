import { describe, expect, it } from "vitest";
import { execute } from "@/engine/execute";
import { getLesson, lessons } from "./lessons";
import { advance, isFinished, startRepo } from "./progress";
import type { Lesson } from "./types";

const ERROR_START = /^(fatal|error|usage|command not found|syntax error|git:|git \w+:|cat:|touch:|ls:|CONFLICT)/;

function play(lesson: Lesson) {
  let repo = startRepo(lesson);
  let completed = 0;
  const stepAfterEach: number[] = [];
  const errors: string[] = [];

  for (const input of lesson.solution) {
    const result = execute(repo, input);
    repo = result.repo;
    if (ERROR_START.test(result.output)) {
      errors.push(`${input} → ${result.output}`);
    }
    completed = advance(lesson, completed, { repo, input });
    stepAfterEach.push(completed);
  }

  return { completed, stepAfterEach, errors };
}

describe("lessons", () => {
  it("have unique ids", () => {
    const ids = lessons.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("can be found by id", () => {
    expect(getLesson("branches")?.title).toBe("Branch and switch");
    expect(getLesson("nope")).toBeUndefined();
  });

  for (const lesson of lessons) {
    describe(lesson.title, () => {
      it("has at least one step and a solution", () => {
        expect(lesson.steps.length).toBeGreaterThan(0);
        expect(lesson.solution.length).toBeGreaterThan(0);
      });

      it("sets up without errors", () => {
        let repo = startRepo({ ...lesson, setup: [] });
        for (const input of lesson.setup) {
          const result = execute(repo, input);
          expect(result.output, input).not.toMatch(ERROR_START);
          repo = result.repo;
        }
      });

      it("does not start with any step already done", () => {
        expect(advance(lesson, 0, { repo: startRepo(lesson), input: "" })).toBe(0);
      });

      it("is completed by its solution", () => {
        const { completed } = play(lesson);
        expect(isFinished(lesson, completed)).toBe(true);
      });

      it("runs its solution without any errors", () => {
        expect(play(lesson).errors).toEqual([]);
      });

      it("finishes the last step only on the last command", () => {
        const { stepAfterEach } = play(lesson);
        const beforeLast = stepAfterEach[stepAfterEach.length - 2] ?? 0;
        expect(beforeLast).toBeLessThan(lesson.steps.length);
      });
    });
  }
});
