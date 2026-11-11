import { describe, expect, it } from "vitest";
import { createEmptyRepo } from "./repo";

describe("createEmptyRepo", () => {
  it("starts uninitialized with no files, commits or branches", () => {
    const repo = createEmptyRepo();

    expect(repo.initialized).toBe(false);
    expect(repo.workingDir).toEqual({});
    expect(repo.index).toEqual({});
    expect(repo.commits).toEqual({});
    expect(repo.branches).toEqual({});
  });

  it("has head set to main", () => {
    const repo = createEmptyRepo();

    expect(repo.head).toBe("main");
  });

  it("returns a fresh repo every time", () => {
    const first = createEmptyRepo();
    const second = createEmptyRepo();

    first.workingDir["notes.txt"] = "hello";

    expect(second.workingDir).toEqual({});
  });
});
