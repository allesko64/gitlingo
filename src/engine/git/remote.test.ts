import { describe, expect, it } from "vitest";
import { execute } from "../execute";
import { runAll } from "../test-utils";
import type { Repo } from "../types";
import { makeCommit } from "./helpers";
import { history } from "./log";
import { computeStatus } from "./status";

const URL = "https://github.com/you/hello.git";
const COMMITTED = ["git init", "echo Hello > hello.txt", "git add hello.txt", 'git commit -m "Add hello"'];
const PUSHED = [...COMMITTED, `git remote add origin ${URL}`, "git push -u origin main"];

function teammatePushes(repo: Repo, message: string, path: string): Repo {
  if (repo.remote === null) {
    throw new Error("no remote");
  }
  const parent = repo.remote.branches["main"];
  const commit = makeCommit(repo, message, [parent], { ...repo.commits[parent].tree, [path]: message });
  return {
    ...repo,
    commits: { ...repo.commits, [commit.hash]: commit },
    remote: { ...repo.remote, branches: { ...repo.remote.branches, main: commit.hash } },
  };
}

describe("git remote", () => {
  it("adds and lists a remote", () => {
    const { repo, output } = runAll([...COMMITTED, `git remote add origin ${URL}`, "git remote -v"]);

    expect(repo.remote).toEqual({ name: "origin", url: URL, branches: {} });
    expect(output).toBe(`origin\t${URL} (fetch)\norigin\t${URL} (push)`);
  });

  it("refuses a second remote with the same name", () => {
    expect(runAll([...PUSHED, `git remote add origin ${URL}`]).output).toBe("error: remote origin already exists.");
  });
});

describe("git push", () => {
  it("needs a remote", () => {
    expect(runAll([...COMMITTED, "git push"]).output).toContain("No configured push destination");
  });

  it("needs an upstream for a bare git push", () => {
    expect(runAll([...COMMITTED, `git remote add origin ${URL}`, "git push"]).output).toContain(
      "has no upstream branch",
    );
  });

  it("creates the remote branch and sets the upstream with -u", () => {
    const { repo, output } = runAll(PUSHED);

    expect(repo.remote?.branches["main"]).toBe(repo.branches["main"]);
    expect(repo.remoteRefs["origin/main"]).toBe(repo.branches["main"]);
    expect(repo.upstream["main"]).toBe("origin/main");
    expect(output).toBe(`To ${URL}\n * [new branch]      main -> main\nbranch 'main' set up to track 'origin/main'.`);
  });

  it("pushes new commits with a bare git push afterwards", () => {
    const { repo, output } = runAll([
      ...PUSHED,
      "echo Notes > notes.txt",
      "git add notes.txt",
      'git commit -m "Add notes"',
      "git push",
    ]);

    expect(repo.remote?.branches["main"]).toBe(repo.branches["main"]);
    expect(output).toMatch(/^To .*\n {3}[0-9a-f]{7}\.\.[0-9a-f]{7} {2}main -> main$/);
  });

  it("says everything is up to date when nothing changed", () => {
    expect(runAll([...PUSHED, "git push"]).output).toBe("Everything up-to-date");
  });

  it("rejects a push when the remote has commits you do not have", () => {
    const before = teammatePushes(runAll(PUSHED).repo, "README", "README.md");
    const { repo, output } = runAll(
      ["echo Notes > notes.txt", "git add notes.txt", 'git commit -m "Add notes"', "git push"],
      before,
    );

    expect(output).toContain("! [rejected]        main -> main (fetch first)");
    expect(output).toContain("Run 'git pull'");
    expect(repo.remote?.branches["main"]).toBe(before.remote?.branches["main"]);
  });

  it("refuses an unborn branch", () => {
    expect(runAll(["git init", `git remote add origin ${URL}`, "git push -u origin main"]).output).toContain(
      "src refspec main does not match any",
    );
  });
});

describe("git fetch and git status tracking", () => {
  it("reports up to date right after a push", () => {
    expect(runAll([...PUSHED, "git status"]).output).toContain("Your branch is up to date with 'origin/main'.");
  });

  it("reports ahead after a local commit", () => {
    const { output } = runAll([
      ...PUSHED,
      "echo Notes > notes.txt",
      "git add notes.txt",
      'git commit -m "Add notes"',
      "git status",
    ]);

    expect(output).toContain("Your branch is ahead of 'origin/main' by 1 commit.");
  });

  it("only learns about remote commits after a fetch", () => {
    const before = teammatePushes(runAll(PUSHED).repo, "README", "README.md");

    expect(execute(before, "git status").output).toContain("up to date");

    const fetched = execute(before, "git fetch");
    expect(fetched.output).toMatch(/^From .*\n {3}[0-9a-f]{7}\.\.[0-9a-f]{7} {2}main {7}-> origin\/main$/);
    expect(fetched.repo.remoteRefs["origin/main"]).toBe(before.remote?.branches["main"]);
    expect(fetched.repo.workingDir).toEqual(before.workingDir);
    expect(execute(fetched.repo, "git status").output).toContain(
      "Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.",
    );
  });

  it("prints nothing when there is nothing new", () => {
    expect(runAll([...PUSHED, "git fetch"]).output).toBe("");
  });

  it("shows origin/main in git log", () => {
    const { output } = runAll([...PUSHED, "git log --oneline"]);
    expect(output).toMatch(/\(HEAD -> main, origin\/main\) Add hello$/);
  });
});

describe("git pull", () => {
  it("fast-forwards when the local branch has nothing new", () => {
    const before = teammatePushes(runAll(PUSHED).repo, "README", "README.md");
    const { repo, output } = execute(before, "git pull");

    expect(output).toContain("Fast-forward");
    expect(repo.workingDir).toEqual({ "hello.txt": "Hello", "README.md": "README" });
    expect(repo.branches["main"]).toBe(before.remote?.branches["main"]);
    expect(computeStatus(repo)).toEqual({ staged: [], unstaged: [], untracked: [] });
  });

  it("makes a merge commit when both sides have commits, then push succeeds", () => {
    const before = teammatePushes(runAll(PUSHED).repo, "README", "README.md");
    const { repo, output } = runAll(
      ["echo Notes > notes.txt", "git add notes.txt", 'git commit -m "Add notes"', "git pull", "git push"],
      before,
    );

    const head = repo.commits[repo.branches["main"]];
    expect(head.parents).toHaveLength(2);
    expect(head.message).toBe(`Merge branch 'main' of ${URL}`);
    expect(history(repo).map((c) => c.message)).toContain("README");
    expect(repo.remote?.branches["main"]).toBe(head.hash);
    expect(output).toMatch(/main -> main$/);
  });

  it("needs tracking information or an explicit branch", () => {
    const noUpstream = [...COMMITTED, `git remote add origin ${URL}`, "git push origin main"];

    expect(runAll([...noUpstream, "git pull"]).output).toContain("There is no tracking information");
    expect(runAll([...noUpstream, "git pull origin main"]).output).toBe("Already up to date.");
  });
});
