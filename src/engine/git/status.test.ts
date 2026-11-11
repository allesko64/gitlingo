import { describe, expect, it } from "vitest";
import { execute } from "../execute";
import { createEmptyRepo } from "../repo";
import { runAll } from "../test-utils";
import type { FileTree, Repo } from "../types";
import { computeStatus } from "./status";

function repoWith(parts: { committed?: FileTree; index?: FileTree; workingDir?: FileTree }): Repo {
  const repo: Repo = { ...createEmptyRepo(), initialized: true };

  if (parts.committed === undefined) {
    const index = parts.index ?? {};
    return { ...repo, index, workingDir: parts.workingDir ?? index };
  }

  const index = parts.index ?? parts.committed;
  return {
    ...repo,
    commits: { c1: { hash: "c1", order: 1, message: "first", parents: [], tree: parts.committed } },
    branches: { main: "c1" },
    index,
    workingDir: parts.workingDir ?? index,
  };
}

describe("git status before init", () => {
  it("refuses to run outside a repository", () => {
    expect(runAll(["git status"]).output).toBe(
      "fatal: not a git repository (or any of the parent directories): .git",
    );
  });
});

describe("computeStatus", () => {
  it("finds nothing in a new empty repository", () => {
    expect(computeStatus(repoWith({}))).toEqual({ staged: [], unstaged: [], untracked: [] });
  });

  it("finds an untracked file", () => {
    const status = computeStatus(repoWith({ workingDir: { "a.txt": "hi" } }));

    expect(status.untracked).toEqual(["a.txt"]);
    expect(status.staged).toEqual([]);
  });

  it("finds a staged new file", () => {
    const status = computeStatus(repoWith({ index: { "a.txt": "hi" } }));

    expect(status.staged).toEqual([{ path: "a.txt", kind: "new file" }]);
    expect(status.untracked).toEqual([]);
  });

  it("finds a staged modification", () => {
    const status = computeStatus(
      repoWith({ committed: { "a.txt": "one" }, index: { "a.txt": "two" } }),
    );

    expect(status.staged).toEqual([{ path: "a.txt", kind: "modified" }]);
  });

  it("finds an unstaged modification", () => {
    const status = computeStatus(
      repoWith({ committed: { "a.txt": "one" }, workingDir: { "a.txt": "two" } }),
    );

    expect(status.unstaged).toEqual([{ path: "a.txt", kind: "modified" }]);
    expect(status.staged).toEqual([]);
  });

  it("shows a file as both staged and unstaged when it changed again after add", () => {
    const status = computeStatus(
      repoWith({
        committed: { "a.txt": "one" },
        index: { "a.txt": "two" },
        workingDir: { "a.txt": "three" },
      }),
    );

    expect(status.staged).toEqual([{ path: "a.txt", kind: "modified" }]);
    expect(status.unstaged).toEqual([{ path: "a.txt", kind: "modified" }]);
  });

  it("finds a file deleted from the working folder", () => {
    const status = computeStatus(repoWith({ committed: { "a.txt": "one" }, workingDir: {} }));

    expect(status.unstaged).toEqual([{ path: "a.txt", kind: "deleted" }]);
  });

  it("finds nothing when everything matches the last commit", () => {
    expect(computeStatus(repoWith({ committed: { "a.txt": "one" } }))).toEqual({
      staged: [],
      unstaged: [],
      untracked: [],
    });
  });

  it("lists files in alphabetical order", () => {
    const status = computeStatus(repoWith({ workingDir: { "c.txt": "", "a.txt": "", "b.txt": "" } }));

    expect(status.untracked).toEqual(["a.txt", "b.txt", "c.txt"]);
  });
});

describe("git status output", () => {
  it("describes a brand-new empty repository", () => {
    expect(runAll(["git init", "git status"]).output).toBe(
      [
        "On branch main",
        "",
        "No commits yet",
        "",
        'nothing to commit (create/copy files and use "git add" to track)',
      ].join("\n"),
    );
  });

  it("lists untracked files", () => {
    expect(runAll(["git init", "touch a.txt", "git status"]).output).toBe(
      [
        "On branch main",
        "",
        "No commits yet",
        "",
        "Untracked files:",
        "  a.txt",
        "",
        'nothing added to commit but untracked files present (use "git add" to track)',
      ].join("\n"),
    );
  });

  it("says the tree is clean when nothing changed", () => {
    const repo = repoWith({ committed: { "a.txt": "one" } });

    expect(execute(repo, "git status").output).toBe(
      ["On branch main", "", "nothing to commit, working tree clean"].join("\n"),
    );
  });

  it("shows every section with aligned labels", () => {
    const repo = repoWith({
      committed: { "a.txt": "one", "b.txt": "one" },
      index: { "a.txt": "two", "b.txt": "one", "c.txt": "new" },
      workingDir: { "a.txt": "two", "c.txt": "new", "d.txt": "" },
    });

    expect(execute(repo, "git status").output).toBe(
      [
        "On branch main",
        "",
        "Changes to be committed:",
        "  modified:   a.txt",
        "  new file:   c.txt",
        "",
        "Changes not staged for commit:",
        "  deleted:    b.txt",
        "",
        "Untracked files:",
        "  d.txt",
      ].join("\n"),
    );
  });

  it("asks you to stage when only unstaged changes exist", () => {
    const repo = repoWith({ committed: { "a.txt": "one" }, workingDir: { "a.txt": "two" } });

    expect(execute(repo, "git status").output).toContain(
      'no changes added to commit (use "git add" to stage changes)',
    );
  });

  it("does not support options yet", () => {
    expect(runAll(["git init", "git status -s"]).output).toBe(
      "git status: options are not supported yet",
    );
  });

  it("never changes the repo", () => {
    const repo = repoWith({ committed: { "a.txt": "one" }, workingDir: { "a.txt": "two" } });
    const before = structuredClone(repo);

    const result = execute(repo, "git status");

    expect(repo).toEqual(before);
    expect(result.repo).toBe(repo);
  });
});
