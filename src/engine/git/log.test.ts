import { describe, expect, it } from "vitest";
import { execute } from "../execute";
import { runAll } from "../test-utils";

const TWO_COMMITS = [
  "git init",
  "echo one > a.txt",
  "git add a.txt",
  'git commit -m "first"',
  "echo two > a.txt",
  "git add a.txt",
  'git commit -m "second"',
];

function hashes() {
  const { repo } = runAll(TWO_COMMITS);
  const second = repo.branches["main"];
  const first = repo.commits[second].parents[0];
  return { repo, first, second };
}

describe("git log", () => {
  it("refuses to run outside a repository", () => {
    expect(runAll(["git log"]).output).toBe(
      "fatal: not a git repository (or any of the parent directories): .git",
    );
  });

  it("explains that there are no commits yet", () => {
    expect(runAll(["git init", "git log"]).output).toBe(
      "fatal: your current branch 'main' does not have any commits yet",
    );
  });

  it("shows a single commit", () => {
    const { repo, output } = runAll([
      "git init",
      "touch a.txt",
      "git add a.txt",
      'git commit -m "first"',
      "git log",
    ]);

    expect(output).toBe(`commit ${repo.branches["main"]} (HEAD -> main)\n\n    first`);
  });

  it("shows commits newest first", () => {
    const { repo, first, second } = hashes();

    expect(execute(repo, "git log").output).toBe(
      [
        `commit ${second} (HEAD -> main)`,
        "",
        "    second",
        "",
        `commit ${first}`,
        "",
        "    first",
      ].join("\n"),
    );
  });

  it("shows one line per commit with --oneline", () => {
    const { repo, first, second } = hashes();

    expect(execute(repo, "git log --oneline").output).toBe(
      `${second} (HEAD -> main) second\n${first} first`,
    );
  });

  it("labels every branch that points at a commit", () => {
    const { repo, first, second } = hashes();
    const withBranches = { ...repo, branches: { ...repo.branches, zeta: second, alpha: first } };

    expect(execute(withBranches, "git log --oneline").output).toBe(
      `${second} (HEAD -> main, zeta) second\n${first} (alpha) first`,
    );
  });

  it("does not support other options yet", () => {
    const { repo } = hashes();

    expect(execute(repo, "git log -p").output).toBe("git log: only --oneline is supported");
  });

  it("never changes the repo", () => {
    const { repo } = hashes();

    expect(execute(repo, "git log").repo).toBe(repo);
  });
});
