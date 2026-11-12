import { describe, expect, it } from "vitest";
import { runAll } from "../test-utils";
import { computeStatus } from "./status";

const COMMITTED = ["git init", "echo Hello > hello.txt", "git add hello.txt", 'git commit -m "Add hello"'];

describe("git restore", () => {
  it("puts the index copy back into the working folder", () => {
    const { repo, output } = runAll([...COMMITTED, "echo Oops > hello.txt", "git restore hello.txt"]);

    expect(output).toBe("");
    expect(repo.workingDir["hello.txt"]).toBe("Hello");
    expect(computeStatus(repo)).toEqual({ staged: [], unstaged: [], untracked: [] });
  });

  it("unstages with --staged but keeps the edit", () => {
    const { repo } = runAll([
      ...COMMITTED,
      "echo Oops > hello.txt",
      "git add hello.txt",
      "git restore --staged hello.txt",
    ]);

    expect(repo.workingDir["hello.txt"]).toBe("Oops");
    expect(repo.index["hello.txt"]).toBe("Hello");
  });

  it("removes a brand new file from the index with --staged", () => {
    const { repo } = runAll([...COMMITTED, "touch new.txt", "git add new.txt", "git restore --staged new.txt"]);

    expect(repo.index).not.toHaveProperty("new.txt");
    expect(computeStatus(repo).untracked).toEqual(["new.txt"]);
  });

  it("reports unknown paths", () => {
    expect(runAll([...COMMITTED, "git restore nope.txt"]).output).toBe(
      "error: pathspec 'nope.txt' did not match any file(s) known to git",
    );
  });

  it("needs a path", () => {
    expect(runAll([...COMMITTED, "git restore"]).output).toBe("fatal: you must specify path(s) to restore");
  });
});
