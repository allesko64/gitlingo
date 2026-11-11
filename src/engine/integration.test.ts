import { describe, expect, it } from "vitest";
import { createEmptyRepo } from "./repo";
import { execute } from "./execute";
import { computeStatus } from "./git/status";
import type { Repo } from "./types";

describe("a full git session", () => {
  it("goes from an empty folder to a merged feature branch", () => {
    let repo: Repo = createEmptyRepo();

    function type(input: string): string {
      const result = execute(repo, input);
      repo = result.repo;
      return result.output;
    }

    expect(type("git status")).toContain("not a git repository");
    expect(type("git init")).toBe("Initialized empty Git repository in .git/");

    type("echo '# My project' > README.md");
    expect(type("ls")).toBe("README.md");
    expect(type("git status")).toContain("Untracked files:\n  README.md");

    expect(type("git add README.md")).toBe("");
    expect(type("git status")).toContain("new file:   README.md");
    expect(type('git commit -m "Add readme"')).toMatch(/^\[main \(root-commit\) [0-9a-f]{7}\] Add readme/);

    expect(type("git branch feature")).toBe("");
    expect(type("git branch")).toBe("  feature\n* main");
    expect(type("git switch feature")).toBe("Switched to branch 'feature'");

    type("echo 'hello' > app.txt");
    type("git add .");
    type('git commit -m "Add app"');

    expect(type("git switch main")).toBe("Switched to branch 'main'");
    expect(type("ls")).toBe("README.md");

    type("echo 'MIT' > LICENSE");
    type("git add LICENSE");
    type('git commit -m "Add license"');

    expect(type("git merge feature")).toBe("Merge made by the 'ort' strategy.\n 1 file changed");
    expect(type("ls")).toBe("LICENSE  README.md  app.txt");
    expect(type("cat app.txt")).toBe("hello");
    expect(computeStatus(repo)).toEqual({ staged: [], unstaged: [], untracked: [] });

    const log = type("git log --oneline").split("\n");
    expect(log).toHaveLength(4);
    expect(log[0]).toMatch(/^[0-9a-f]{7} \(HEAD -> main\) Merge branch 'feature'$/);
    expect(log[1]).toMatch(/ Add license$/);
    expect(log[2]).toMatch(/ \(feature\) Add app$/);
    expect(log[3]).toMatch(/ Add readme$/);
  });
});
