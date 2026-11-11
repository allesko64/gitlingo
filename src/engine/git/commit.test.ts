import { describe, expect, it } from "vitest";
import { execute } from "../execute";
import { runAll } from "../test-utils";
import { computeStatus } from "./status";

const READY = ["git init", "echo hi > a.txt", "git add a.txt"];

describe("git commit", () => {
  it("refuses to run outside a repository", () => {
    expect(runAll(['git commit -m "x"']).output).toBe(
      "fatal: not a git repository (or any of the parent directories): .git",
    );
  });

  it("saves the staged files as the first commit", () => {
    const { repo } = runAll([...READY, 'git commit -m "first commit"']);

    const hash = repo.branches["main"];
    expect(repo.commits[hash]).toEqual({
      hash,
      order: 1,
      message: "first commit",
      parents: [],
      tree: { "a.txt": "hi" },
    });
  });

  it("creates the main branch on the first commit", () => {
    const { repo } = runAll([...READY, 'git commit -m "first commit"']);

    expect(Object.keys(repo.branches)).toEqual(["main"]);
    expect(repo.branches["main"]).toMatch(/^[0-9a-f]{7}$/);
  });

  it("prints a summary like real git", () => {
    const { repo, output } = runAll([...READY, 'git commit -m "first commit"']);

    expect(output).toBe(`[main (root-commit) ${repo.branches["main"]}] first commit\n 1 file changed`);
  });

  it("links a second commit to the first one", () => {
    const first = runAll([...READY, 'git commit -m "one"']).repo;
    const firstHash = first.branches["main"];

    const { repo, output } = runAll([
      ...READY,
      'git commit -m "one"',
      "echo bye > a.txt",
      "touch b.txt",
      "git add .",
      'git commit -m "two"',
    ]);

    const secondHash = repo.branches["main"];
    expect(secondHash).not.toBe(firstHash);
    expect(repo.commits[secondHash].parents).toEqual([firstHash]);
    expect(Object.keys(repo.commits)).toHaveLength(2);
    expect(output).toBe(`[main ${secondHash}] two\n 2 files changed`);
  });

  it("leaves a clean working tree", () => {
    const { repo } = runAll([...READY, 'git commit -m "first commit"']);

    expect(computeStatus(repo)).toEqual({ staged: [], unstaged: [], untracked: [] });
  });

  it("only saves what was staged", () => {
    const { repo } = runAll([
      "git init",
      "echo hi > a.txt",
      "touch b.txt",
      "git add a.txt",
      "echo changed > a.txt",
      'git commit -m "first"',
    ]);

    expect(repo.commits[repo.branches["main"]].tree).toEqual({ "a.txt": "hi" });
    expect(computeStatus(repo).unstaged).toEqual([{ path: "a.txt", kind: "modified" }]);
    expect(computeStatus(repo).untracked).toEqual(["b.txt"]);
  });

  it("refuses when nothing is staged and shows the status", () => {
    const { repo, output } = runAll(["git init", "touch a.txt", 'git commit -m "x"']);

    expect(output).toContain("Untracked files:");
    expect(output).toContain("nothing added to commit but untracked files present");
    expect(repo.commits).toEqual({});
  });

  it("refuses a second commit with no new changes", () => {
    const { output } = runAll([...READY, 'git commit -m "one"', 'git commit -m "two"']);

    expect(output).toContain("nothing to commit, working tree clean");
  });

  it("needs -m", () => {
    expect(runAll([...READY, "git commit"]).output).toBe(
      'git commit: only git commit -m "message" is supported (the text editor is not available here)',
    );
    expect(runAll([...READY, "git commit -a"]).output).toBe(
      'git commit: only git commit -m "message" is supported',
    );
  });

  it("needs a message after -m", () => {
    expect(runAll([...READY, "git commit -m"]).output).toBe("error: switch `m' requires a value");
    expect(runAll([...READY, 'git commit -m ""']).output).toBe(
      "error: switch `m' requires a value",
    );
  });

  it("hints at quotes when the message has unquoted spaces", () => {
    const { repo, output } = runAll([...READY, "git commit -m first commit"]);

    expect(output).toBe(
      [
        "error: pathspec 'commit' did not match any file(s) known to git",
        'hint: put the message in quotes: git commit -m "first commit"',
      ].join("\n"),
    );
    expect(repo.commits).toEqual({});
  });

  it("never changes the repo it was given", () => {
    const repo = runAll(READY).repo;
    const before = structuredClone(repo);

    execute(repo, 'git commit -m "first"');

    expect(repo).toEqual(before);
  });
});
