import { describe, expect, it } from "vitest";
import { execute } from "../execute";
import { runAll } from "../test-utils";

const ONE_COMMIT = ["git init", "touch a.txt", "git add a.txt", 'git commit -m "first"'];

describe("git branch", () => {
  it("refuses to run outside a repository", () => {
    expect(runAll(["git branch"]).output).toBe(
      "fatal: not a git repository (or any of the parent directories): .git",
    );
  });

  it("lists nothing before the first commit", () => {
    expect(runAll(["git init", "git branch"]).output).toBe("");
  });

  it("marks the current branch with a star", () => {
    expect(runAll([...ONE_COMMIT, "git branch"]).output).toBe("* main");
  });

  it("creates a branch at the current commit", () => {
    const { repo, output } = runAll([...ONE_COMMIT, "git branch feature"]);

    expect(output).toBe("");
    expect(repo.branches["feature"]).toBe(repo.branches["main"]);
  });

  it("stays on the current branch after creating one", () => {
    const { repo } = runAll([...ONE_COMMIT, "git branch feature"]);

    expect(repo.head).toBe("main");
  });

  it("lists branches in alphabetical order", () => {
    expect(runAll([...ONE_COMMIT, "git branch zeta", "git branch alpha", "git branch"]).output).toBe(
      "  alpha\n* main\n  zeta",
    );
  });

  it("shows the new branch in git log", () => {
    const { output } = runAll([...ONE_COMMIT, "git branch feature", "git log --oneline"]);

    expect(output).toMatch(/^[0-9a-f]{7} \(HEAD -> main, feature\) first$/);
  });

  it("allows slashes, dots and dashes in names", () => {
    const { repo } = runAll([...ONE_COMMIT, "git branch fix/login-v1.2"]);

    expect(Object.hasOwn(repo.branches, "fix/login-v1.2")).toBe(true);
  });

  it("refuses a name that already exists", () => {
    expect(runAll([...ONE_COMMIT, "git branch main"]).output).toBe(
      "fatal: a branch named 'main' already exists",
    );
  });

  it("refuses invalid names", () => {
    expect(runAll([...ONE_COMMIT, "git branch .hidden"]).output).toBe(
      "fatal: '.hidden' is not a valid branch name",
    );
  });

  it("explains that a commit is needed first", () => {
    expect(runAll(["git init", "git branch feature"]).output).toBe(
      "fatal: not a valid object name: 'main'\nhint: make your first commit before creating branches",
    );
  });

  it("does not support options yet", () => {
    expect(runAll([...ONE_COMMIT, "git branch -d main"]).output).toBe(
      "git branch: option '-d' is not supported yet",
    );
  });

  it("creates only one branch at a time", () => {
    expect(runAll([...ONE_COMMIT, "git branch a b"]).output).toBe(
      "git branch: only one branch name at a time",
    );
  });

  it("never changes the repo it was given", () => {
    const repo = runAll(ONE_COMMIT).repo;
    const before = structuredClone(repo);

    execute(repo, "git branch feature");

    expect(repo).toEqual(before);
  });
});
