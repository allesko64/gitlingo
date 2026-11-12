import { describe, expect, it } from "vitest";
import { runAll } from "../test-utils";
import { history } from "./log";
import { computeStatus } from "./status";

const TWO_COMMITS = [
  "git init",
  "echo Hello > hello.txt",
  "git add hello.txt",
  'git commit -m "Add hello"',
  "echo Notes > notes.txt",
  "git add notes.txt",
  'git commit -m "Add notes"',
];

describe("git reset", () => {
  it("--soft moves the branch and keeps the changes staged", () => {
    const { repo, output } = runAll([...TWO_COMMITS, "git reset --soft HEAD~1"]);

    expect(output).toBe("");
    expect(history(repo).map((c) => c.message)).toEqual(["Add hello"]);
    expect(computeStatus(repo).staged).toEqual([{ path: "notes.txt", kind: "new file" }]);
    expect(repo.workingDir["notes.txt"]).toBe("Notes");
  });

  it("--mixed (the default) moves the branch and unstages", () => {
    const { repo, output } = runAll([...TWO_COMMITS, "git reset HEAD~1"]);

    expect(output).toBe("");
    expect(computeStatus(repo).staged).toEqual([]);
    expect(computeStatus(repo).untracked).toEqual(["notes.txt"]);
  });

  it("--mixed reports modified files left behind", () => {
    const { output } = runAll([
      ...TWO_COMMITS,
      "echo Changed > hello.txt",
      "git add hello.txt",
      'git commit -m "Change hello"',
      "git reset HEAD~1",
    ]);

    expect(output).toBe("Unstaged changes after reset:\nM\thello.txt");
  });

  it("--hard throws the changes away", () => {
    const before = runAll(TWO_COMMITS).repo;
    const { repo, output } = runAll(["git reset --hard HEAD~1"], before);
    const target = history(repo)[0];

    expect(output).toBe(`HEAD is now at ${target.hash} Add hello`);
    expect(repo.workingDir).toEqual({ "hello.txt": "Hello" });
    expect(computeStatus(repo)).toEqual({ staged: [], unstaged: [], untracked: [] });
  });

  it("unstages a single file with git reset <file>", () => {
    const { repo } = runAll([...TWO_COMMITS, "echo Changed > hello.txt", "git add hello.txt", "git reset hello.txt"]);

    expect(computeStatus(repo).staged).toEqual([]);
    expect(computeStatus(repo).unstaged).toEqual([{ path: "hello.txt", kind: "modified" }]);
  });

  it("reports an unknown target", () => {
    expect(runAll([...TWO_COMMITS, "git reset --hard nope"]).output).toBe(
      "fatal: ambiguous argument 'nope': unknown revision or path not in the working tree.",
    );
  });

  it("reports walking past the root commit", () => {
    expect(runAll([...TWO_COMMITS, "git reset --hard HEAD~5"]).output).toContain("ambiguous argument 'HEAD~5'");
  });
});
