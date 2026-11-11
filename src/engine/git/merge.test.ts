import { describe, expect, it } from "vitest";
import { execute } from "../execute";
import { runAll } from "../test-utils";
import { history } from "./log";
import { computeStatus } from "./status";

const BASE = [
  "git init",
  "echo base > a.txt",
  "git add a.txt",
  'git commit -m "base"',
  "git branch feature",
];

const FEATURE_AHEAD = [
  ...BASE,
  "git switch feature",
  "echo feature > b.txt",
  "git add b.txt",
  'git commit -m "add b"',
  "git switch main",
];

const DIVERGED = [
  ...FEATURE_AHEAD,
  "echo main > c.txt",
  "git add c.txt",
  'git commit -m "add c"',
];

describe("git merge", () => {
  it("refuses to run outside a repository", () => {
    expect(runAll(["git merge feature"]).output).toBe(
      "fatal: not a git repository (or any of the parent directories): .git",
    );
  });

  describe("fast-forward", () => {
    it("moves the branch forward when there is nothing new on it", () => {
      const before = runAll(FEATURE_AHEAD).repo;
      const { repo, output } = execute(before, "git merge feature");

      expect(repo.branches["main"]).toBe(before.branches["feature"]);
      expect(output).toBe(
        `Updating ${before.branches["main"]}..${before.branches["feature"]}\nFast-forward\n 1 file changed`,
      );
    });

    it("brings the branch's files into the working folder", () => {
      const { repo } = runAll([...FEATURE_AHEAD, "git merge feature"]);

      expect(repo.workingDir).toEqual({ "a.txt": "base", "b.txt": "feature" });
      expect(computeStatus(repo)).toEqual({ staged: [], unstaged: [], untracked: [] });
    });

    it("does not create a new commit", () => {
      const { repo } = runAll([...FEATURE_AHEAD, "git merge feature"]);

      expect(Object.keys(repo.commits)).toHaveLength(2);
    });
  });

  describe("already up to date", () => {
    it("does nothing when merging a branch you already contain", () => {
      const before = runAll([...FEATURE_AHEAD, "git switch feature"]).repo;
      const { repo, output } = execute(before, "git merge main");

      expect(output).toBe("Already up to date.");
      expect(repo).toBe(before);
    });

    it("does nothing when merging the current branch", () => {
      expect(runAll([...BASE, "git merge main"]).output).toBe("Already up to date.");
    });
  });

  describe("merge commit", () => {
    it("creates a commit with both branches as parents", () => {
      const before = runAll(DIVERGED).repo;
      const { repo, output } = execute(before, "git merge feature");

      const merged = repo.commits[repo.branches["main"]];
      expect(merged.parents).toEqual([before.branches["main"], before.branches["feature"]]);
      expect(merged.message).toBe("Merge branch 'feature'");
      expect(merged.tree).toEqual({ "a.txt": "base", "b.txt": "feature", "c.txt": "main" });
      expect(output).toBe("Merge made by the 'ort' strategy.\n 1 file changed");
    });

    it("updates the working folder and leaves it clean", () => {
      const { repo } = runAll([...DIVERGED, "git merge feature"]);

      expect(repo.workingDir).toEqual({ "a.txt": "base", "b.txt": "feature", "c.txt": "main" });
      expect(computeStatus(repo)).toEqual({ staged: [], unstaged: [], untracked: [] });
    });

    it("shows commits from both branches in git log", () => {
      const { repo } = runAll([...DIVERGED, "git merge feature"]);

      expect(history(repo).map((c) => c.message)).toEqual([
        "Merge branch 'feature'",
        "add c",
        "add b",
        "base",
      ]);
    });

    it("keeps the same change made on both branches", () => {
      const { repo, output } = runAll([
        ...BASE,
        "git switch feature",
        "echo same > a.txt",
        "git add a.txt",
        'git commit -m "feature edit"',
        "git switch main",
        "echo same > a.txt",
        "touch c.txt",
        "git add .",
        'git commit -m "main edit"',
        "git merge feature",
      ]);

      expect(output).toContain("Merge made by");
      expect(repo.workingDir["a.txt"]).toBe("same");
    });

    it("keeps a file that one branch deleted deleted", () => {
      const onFeature = runAll([...BASE, "git switch feature", "touch b.txt", "git add b.txt"]).repo;
      const deleted = { ...onFeature, workingDir: { "b.txt": "" } };
      const { repo } = runAll(
        [
          "git add a.txt",
          'git commit -m "delete a"',
          "git switch main",
          "touch c.txt",
          "git add c.txt",
          'git commit -m "add c"',
          "git merge feature",
        ],
        deleted,
      );

      expect(repo.workingDir).toEqual({ "b.txt": "", "c.txt": "" });
    });
  });

  describe("refusals", () => {
    it("refuses conflicts with a coming soon message and changes nothing", () => {
      const before = runAll([
        ...BASE,
        "git switch feature",
        "echo theirs > a.txt",
        "git add a.txt",
        'git commit -m "feature edit"',
        "git switch main",
        "echo ours > a.txt",
        "git add a.txt",
        'git commit -m "main edit"',
      ]).repo;
      const { repo, output } = execute(before, "git merge feature");

      expect(output).toBe(
        [
          "CONFLICT: both branches changed a.txt in different ways",
          "Resolving merge conflicts is coming soon to Git Lingo.",
          "The merge was cancelled and nothing was changed.",
        ].join("\n"),
      );
      expect(repo).toBe(before);
    });

    it("refuses when local changes would be overwritten", () => {
      const { repo, output } = runAll([...FEATURE_AHEAD, "touch b.txt", "git merge feature"]);

      expect(output).toContain("untracked working tree files would be overwritten by merge");
      expect(output).toContain("Please move or remove them before you merge.");
      expect(repo.branches["main"]).not.toBe(repo.branches["feature"]);
    });

    it("reports a branch that does not exist", () => {
      expect(runAll([...BASE, "git merge nope"]).output).toBe(
        "merge: nope - not something we can merge",
      );
    });

    it("needs a branch name", () => {
      expect(runAll([...BASE, "git merge"]).output).toBe(
        "fatal: no branch specified (try: git merge <branch>)",
      );
    });

    it("does not support options yet", () => {
      expect(runAll([...BASE, "git merge --no-ff feature"]).output).toBe(
        "git merge: option '--no-ff' is not supported yet",
      );
    });
  });

  it("never changes the repo it was given", () => {
    const repo = runAll(DIVERGED).repo;
    const before = structuredClone(repo);

    execute(repo, "git merge feature");

    expect(repo).toEqual(before);
  });
});
