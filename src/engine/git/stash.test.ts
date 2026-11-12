import { describe, expect, it } from "vitest";
import { runAll } from "../test-utils";
import { computeStatus } from "./status";

const COMMITTED = ["git init", "echo Hello > hello.txt", "git add hello.txt", 'git commit -m "Add hello"'];

describe("git stash", () => {
  it("parks staged and unstaged changes and cleans the tree", () => {
    const { repo, output } = runAll([
      ...COMMITTED,
      "echo Half > hello.txt",
      "touch notes.txt",
      "git add notes.txt",
      "git stash",
    ]);
    const head = repo.commits[repo.branches["main"]];

    expect(output).toBe(`Saved working directory and index state WIP on main: ${head.hash} Add hello`);
    expect(repo.stash).toHaveLength(1);
    expect(repo.workingDir).toEqual({ "hello.txt": "Hello" });
    expect(computeStatus(repo)).toEqual({ staged: [], unstaged: [], untracked: [] });
  });

  it("leaves untracked files alone", () => {
    const { repo } = runAll([...COMMITTED, "echo Half > hello.txt", "touch scratch.txt", "git stash"]);

    expect(repo.workingDir).toEqual({ "hello.txt": "Hello", "scratch.txt": "" });
  });

  it("has nothing to save on a clean tree", () => {
    const before = runAll(COMMITTED).repo;
    const { repo, output } = runAll(["git stash"], before);

    expect(output).toBe("No local changes to save");
    expect(repo).toBe(before);
  });

  it("lists entries newest first", () => {
    const { output } = runAll([
      ...COMMITTED,
      "echo One > hello.txt",
      "git stash",
      "echo Two > hello.txt",
      "git stash",
      "git stash list",
    ]);

    expect(output.split("\n")).toHaveLength(2);
    expect(output).toMatch(/^stash@\{0\}: WIP on main/);
  });

  it("pop brings the changes back and drops the entry", () => {
    const { repo, output } = runAll([
      ...COMMITTED,
      "echo Half > hello.txt",
      "touch notes.txt",
      "git add notes.txt",
      "git stash",
      "git stash pop",
    ]);

    expect(repo.stash).toEqual([]);
    expect(repo.workingDir["hello.txt"]).toBe("Half");
    expect(computeStatus(repo).staged).toEqual([{ path: "notes.txt", kind: "new file" }]);
    expect(computeStatus(repo).unstaged).toEqual([{ path: "hello.txt", kind: "modified" }]);
    expect(output).toContain("Dropped stash@{0}");
  });

  it("pop with nothing stashed", () => {
    expect(runAll([...COMMITTED, "git stash pop"]).output).toBe("No stash entries found.");
  });

  it("pop refuses to overwrite local changes", () => {
    const { repo, output } = runAll([
      ...COMMITTED,
      "echo Half > hello.txt",
      "git stash",
      "echo Other > hello.txt",
      "git stash pop",
    ]);

    expect(output).toContain("would be overwritten by the stash");
    expect(repo.stash).toHaveLength(1);
  });

  it("survives switching branches", () => {
    const { repo } = runAll([
      ...COMMITTED,
      "git branch feature",
      "git switch feature",
      "echo Feature > hello.txt",
      "git add hello.txt",
      'git commit -m "feature"',
      "git switch main",
      "echo Half > hello.txt",
      "git stash",
      "git switch feature",
      "git switch main",
      "git stash pop",
    ]);

    expect(repo.head).toBe("main");
    expect(repo.workingDir["hello.txt"]).toBe("Half");
  });

  it("rejects unknown subcommands", () => {
    expect(runAll([...COMMITTED, "git stash drop"]).output).toBe(
      "git stash: 'drop' is not a stash command (try push, pop or list)",
    );
  });
});
