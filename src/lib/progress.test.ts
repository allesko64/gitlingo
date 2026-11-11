import { describe, expect, it } from "vitest";
import { lessons } from "@/lessons/lessons";
import {
  currentLevelId,
  isUnlocked,
  levelNumber,
  markComplete,
  nextLessonId,
  parseProgress,
} from "./progress";

const [first, second, third] = lessons.map((lesson) => lesson.id);
const last = lessons[lessons.length - 1].id;

describe("parseProgress", () => {
  it("starts empty when nothing is saved", () => {
    expect(parseProgress(null)).toEqual({ completed: [] });
  });

  it("reads saved lesson ids", () => {
    expect(parseProgress(JSON.stringify({ completed: [first, second] }))).toEqual({ completed: [first, second] });
  });

  it("survives broken or tampered data", () => {
    expect(parseProgress("{not json")).toEqual({ completed: [] });
    expect(parseProgress(JSON.stringify({ completed: "nope" }))).toEqual({ completed: [] });
    expect(parseProgress(JSON.stringify(null))).toEqual({ completed: [] });
    expect(parseProgress(JSON.stringify({ completed: [first, 42, "made-up", first] }))).toEqual({ completed: [first] });
  });
});

describe("markComplete", () => {
  it("adds a lesson once", () => {
    const once = markComplete({ completed: [] }, first);
    expect(markComplete(once, first)).toBe(once);
    expect(once).toEqual({ completed: [first] });
  });

  it("ignores unknown ids", () => {
    const progress = { completed: [] };
    expect(markComplete(progress, "made-up")).toBe(progress);
  });
});

describe("unlocking", () => {
  it("always unlocks level 1 and locks the rest at the start", () => {
    const fresh = { completed: [] };
    expect(isUnlocked(fresh, first)).toBe(true);
    expect(isUnlocked(fresh, second)).toBe(false);
    expect(isUnlocked(fresh, "made-up")).toBe(false);
  });

  it("unlocks a level when the one before it is done", () => {
    const progress = { completed: [first] };
    expect(isUnlocked(progress, second)).toBe(true);
    expect(isUnlocked(progress, third)).toBe(false);
  });

  it("points at the first unfinished level", () => {
    expect(currentLevelId({ completed: [] })).toBe(first);
    expect(currentLevelId({ completed: [first, second] })).toBe(third);
    expect(currentLevelId({ completed: lessons.map((l) => l.id) })).toBe(last);
  });
});

describe("navigation helpers", () => {
  it("finds the next lesson and level numbers", () => {
    expect(nextLessonId(first)).toBe(second);
    expect(nextLessonId(last)).toBeNull();
    expect(levelNumber(first)).toBe(1);
    expect(levelNumber(last)).toBe(lessons.length);
  });
});
