import { describe, expect, it } from "vitest";
import { execute } from "../execute";
import { runAll } from "../test-utils";
import { computeStatus } from "./status";

const BRANCHED = [
  "git init",
  "echo base > a.txt",
  "git add a.txt",
  'git commit -m "base"',
  "git branch feature",
  "git switch feature",
  "echo feature > b.txt",
  "git add b.txt",
  'git commit -m "feature work"',
];

describe("git switch", () => {
  it("refuses to run outside a repository", () => {
    expect(runAll(["git switch main"]).output).toBe(
      "fatal: not a git repository (or any of the parent directories): .git",
    );
  });

  it("moves to another branch", () => {
    const { repo, output } = runAll([
      "git init",
      "touch a.txt",
      "git add a.txt",
      'git commit -m "first"',
      "git branch feature",
      "git switch feature",
    ]);

    expect(repo.head).toBe("feature");
    expect(output).toBe("Switched to branch 'feature'");
  });

  it("removes files that only exist on the branch you leave", () => {
    const { repo } = runAll([...BRANCHED, "git switch main"]);

    expect(repo.workingDir).toEqual({ "a.txt": "base" });
    expect(repo.index).toEqual({ "a.txt": "base" });
  });

  it("brings files back when you return", () => {
    const { repo } = runAll([...BRANCHED, "git switch main", "git switch feature"]);

    expect(repo.workingDir).toEqual({ "a.txt": "base", "b.txt": "feature" });
    expect(computeStatus(repo)).toEqual({ staged: [], unstaged: [], untracked: [] });
  });

  it("says when you are already on the branch", () => {
    expect(runAll([...BRANCHED, "git switch feature"]).output).toBe("Already on 'feature'");
  });

  it("reports a branch that does not exist", () => {
    expect(runAll([...BRANCHED, "git switch nope"]).output).toBe("fatal: invalid reference: nope");
  });

  it("needs a branch name", () => {
    expect(runAll([...BRANCHED, "git switch"]).output).toBe(
      "fatal: missing branch name (try: git switch main)",
    );
  });

  it("explains how to create and switch without -c", () => {
    expect(runAll([...BRANCHED, "git switch -c new"]).output).toBe(
      "git switch: -c is not supported yet. Create the branch first with git branch <name>, then run git switch <name>",
    );
  });

  it("refuses when an unstaged change would be overwritten", () => {
    const before = runAll([...BRANCHED, "echo edited > b.txt"]);
    const after = execute(before.repo, "git switch main");

    expect(after.output).toBe(
      [
        "error: Your local changes to the following files would be overwritten by switch:",
        "  b.txt",
        "Please commit your changes before you switch branches.",
        "Aborting",
      ].join("\n"),
    );
    expect(after.repo).toBe(before.repo);
  });

  it("refuses when a staged change would be overwritten", () => {
    const { repo, output } = runAll([
      ...BRANCHED,
      "echo edited > b.txt",
      "git add b.txt",
      "git switch main",
    ]);

    expect(output).toContain("would be overwritten by switch");
    expect(repo.head).toBe("feature");
  });

  it("keeps your local changes when the file is the same on both branches", () => {
    const { repo, output } = runAll([...BRANCHED, "echo local > a.txt", "git switch main"]);

    expect(output).toBe("Switched to branch 'main'");
    expect(repo.workingDir["a.txt"]).toBe("local");
    expect(computeStatus(repo).unstaged).toEqual([{ path: "a.txt", kind: "modified" }]);
  });

  it("refuses when an untracked file would be overwritten", () => {
    const { repo, output } = runAll([...BRANCHED, "git switch main", "touch b.txt", "git switch feature"]);

    expect(output).toBe(
      [
        "error: The following untracked working tree files would be overwritten by switch:",
        "  b.txt",
        "Please move or remove them before you switch branches.",
        "Aborting",
      ].join("\n"),
    );
    expect(repo.head).toBe("main");
  });

  it("keeps untracked files that the other branch does not have", () => {
    const { repo } = runAll([...BRANCHED, "touch notes.txt", "git switch main"]);

    expect(repo.workingDir["notes.txt"]).toBe("");
  });

  it("never changes the repo it was given", () => {
    const repo = runAll(BRANCHED).repo;
    const before = structuredClone(repo);

    execute(repo, "git switch main");

    expect(repo).toEqual(before);
  });
});

describe("git checkout", () => {
  it("switches branches like git switch", () => {
    const { repo, output } = runAll([...BRANCHED, "git checkout main"]);

    expect(repo.head).toBe("main");
    expect(output).toBe("Switched to branch 'main'");
  });

  it("uses its own wording for a missing branch", () => {
    expect(runAll([...BRANCHED, "git checkout nope"]).output).toBe(
      "error: pathspec 'nope' did not match any file(s) known to git",
    );
  });

  it("explains how to create and switch without -b", () => {
    expect(runAll([...BRANCHED, "git checkout -b new"]).output).toContain(
      "-b is not supported yet",
    );
  });

  it("names itself in the overwrite error", () => {
    expect(runAll([...BRANCHED, "echo edited > b.txt", "git checkout main"]).output).toContain(
      "would be overwritten by checkout",
    );
  });
});
