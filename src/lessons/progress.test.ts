import { describe, expect, it } from "vitest";
import { execute } from "@/engine/execute";
import { createEmptyRepo } from "@/engine/repo";
import { ran } from "./checks";
import { advance, isFinished, startRepo } from "./progress";
import type { Lesson } from "./types";

const lesson: Lesson = {
  id: "test",
  title: "Test",
  intro: "",
  setup: [],
  steps: [
    { instruction: "init", hint: "", isDone: ({ repo }) => repo.initialized },
    { instruction: "status", hint: "", isDone: (ctx) => ran(ctx, "git status") },
  ],
  solution: [],
};

describe("startRepo", () => {
  it("runs the setup commands", () => {
    const repo = startRepo({ ...lesson, setup: ["git init", "touch a.txt"] });

    expect(repo.initialized).toBe(true);
    expect(repo.workingDir).toEqual({ "a.txt": "" });
  });

  it("starts empty when there is no setup", () => {
    expect(startRepo(lesson)).toEqual(createEmptyRepo());
  });
});

describe("advance", () => {
  it("moves to the next step when the current one is done", () => {
    const repo = execute(createEmptyRepo(), "git init").repo;

    expect(advance(lesson, 0, { repo, input: "git init" })).toBe(1);
  });

  it("stays put when the current step is not done", () => {
    expect(advance(lesson, 0, { repo: createEmptyRepo(), input: "ls" })).toBe(0);
  });

  it("does not skip ahead to a later step", () => {
    expect(advance(lesson, 0, { repo: createEmptyRepo(), input: "git status" })).toBe(0);
  });

  it("never goes backwards", () => {
    expect(advance(lesson, 1, { repo: createEmptyRepo(), input: "ls" })).toBe(1);
  });

  it("can finish several steps with one command", () => {
    const repo = execute(createEmptyRepo(), "git init").repo;

    expect(advance(lesson, 0, { repo, input: "git status" })).toBe(2);
  });

  it("stops at the end", () => {
    const repo = execute(createEmptyRepo(), "git init").repo;

    expect(advance(lesson, 2, { repo, input: "git status" })).toBe(2);
  });
});

describe("ran", () => {
  it("matches the command and allows extra words after it", () => {
    expect(ran({ repo: createEmptyRepo(), input: "git log --oneline" }, "git log")).toBe(true);
  });

  it("ignores extra spaces", () => {
    expect(ran({ repo: createEmptyRepo(), input: "  git   status " }, "git status")).toBe(true);
  });

  it("does not match a different command", () => {
    expect(ran({ repo: createEmptyRepo(), input: "git add ." }, "git status")).toBe(false);
  });
});

describe("isFinished", () => {
  it("is true only when every step is done", () => {
    expect(isFinished(lesson, 1)).toBe(false);
    expect(isFinished(lesson, 2)).toBe(true);
  });
});
