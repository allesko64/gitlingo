import { describe, expect, it } from "vitest";
import { execute } from "../execute";
import { runAll } from "../test-utils";
import { computeStatus } from "./status";

describe("git add", () => {
  it("refuses to run outside a repository", () => {
    expect(runAll(["touch a.txt", "git add a.txt"]).output).toBe(
      "fatal: not a git repository (or any of the parent directories): .git",
    );
  });

  it("stages one file", () => {
    const { repo, output } = runAll(["git init", "echo hi > a.txt", "git add a.txt"]);

    expect(repo.index).toEqual({ "a.txt": "hi" });
    expect(output).toBe("");
    expect(computeStatus(repo).staged).toEqual([{ path: "a.txt", kind: "new file" }]);
  });

  it("leaves other files untracked", () => {
    const { repo } = runAll(["git init", "touch a.txt b.txt", "git add a.txt"]);

    expect(computeStatus(repo).untracked).toEqual(["b.txt"]);
  });

  it("stages several files at once", () => {
    const { repo } = runAll(["git init", "touch a.txt b.txt c.txt", "git add a.txt c.txt"]);

    expect(Object.keys(repo.index).sort()).toEqual(["a.txt", "c.txt"]);
  });

  it("stages everything with a dot", () => {
    const { repo } = runAll(["git init", "touch a.txt b.txt", "git add ."]);

    expect(repo.index).toEqual({ "a.txt": "", "b.txt": "" });
    expect(computeStatus(repo).untracked).toEqual([]);
  });

  it("stages the newest content of a file", () => {
    const { repo } = runAll([
      "git init",
      "echo one > a.txt",
      "git add a.txt",
      "echo two > a.txt",
      "git add a.txt",
    ]);

    expect(repo.index["a.txt"]).toBe("two");
    expect(computeStatus(repo).unstaged).toEqual([]);
  });

  it("stages a deleted file by removing it from the index", () => {
    const staged = runAll(["git init", "touch a.txt", "git add a.txt"]).repo;
    const deleted = { ...staged, workingDir: {} };

    const { repo } = execute(deleted, "git add a.txt");

    expect(repo.index).toEqual({});
  });

  it("stages deletions with a dot too", () => {
    const staged = runAll(["git init", "touch a.txt b.txt", "git add ."]).repo;
    const deleted = { ...staged, workingDir: { "b.txt": "" } };

    const { repo } = execute(deleted, "git add .");

    expect(repo.index).toEqual({ "b.txt": "" });
  });

  it("stages nothing when one of the files does not exist", () => {
    const { repo, output } = runAll(["git init", "touch a.txt", "git add a.txt nope.txt"]);

    expect(output).toBe("fatal: pathspec 'nope.txt' did not match any files");
    expect(repo.index).toEqual({});
  });

  it("explains what to do when no file is given", () => {
    expect(runAll(["git init", "git add"]).output).toBe(
      "Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?",
    );
  });

  it("does not support options yet", () => {
    expect(runAll(["git init", "touch a.txt", "git add -p a.txt"]).output).toBe(
      "git add: option '-p' is not supported yet",
    );
  });

  it("never changes the repo it was given", () => {
    const repo = runAll(["git init", "touch a.txt"]).repo;
    const before = structuredClone(repo);

    execute(repo, "git add .");

    expect(repo).toEqual(before);
  });
});
