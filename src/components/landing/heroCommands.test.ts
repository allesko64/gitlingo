import { describe, expect, it } from "vitest";
import { execute } from "@/engine/execute";
import type { Repo } from "@/engine/types";
import { fileZone } from "../terminal/zones";
import { looksLikeError } from "../terminal/output";
import { HERO_SCRIPT, heroFilter, heroStartRepo, heroSuggestion } from "./heroCommands";

function run(commands: string[]): Repo {
  let repo = heroStartRepo();
  for (const command of commands) {
    repo = execute(repo, command).repo;
  }
  return repo;
}

describe("heroStartRepo", () => {
  it("starts with README.md in an uninitialized folder", () => {
    const repo = heroStartRepo();

    expect(repo.initialized).toBe(false);
    expect(Object.keys(repo.workingDir)).toEqual(["README.md"]);
  });

  it("gives every terminal its own repo", () => {
    expect(heroStartRepo()).not.toBe(heroStartRepo());
  });
});

describe("HERO_SCRIPT", () => {
  it("only uses commands the hero allows", () => {
    for (const command of HERO_SCRIPT) {
      expect(heroFilter(command), command).toBeNull();
    }
  });

  it("runs without errors and ends with README.md committed", () => {
    let repo = heroStartRepo();
    for (const command of HERO_SCRIPT) {
      const result = execute(repo, command);
      expect(looksLikeError(result.output), `${command} → ${result.output}`).toBe(false);
      repo = result.repo;
    }

    expect(fileZone(repo, "README.md")).toBe("local");
  });
});

describe("heroFilter", () => {
  it("allows the hero commands", () => {
    for (const command of ["git init", "git status", "git add .", 'git commit -m "x"', "git log --oneline"]) {
      expect(heroFilter(command)).toBeNull();
    }
  });

  it("blocks everything else with a plain message", () => {
    expect(heroFilter("ls")).toBe("ls is not supported here yet. Type help to see what you can try.");
    expect(heroFilter("git push")).toContain("not supported here yet");
    expect(heroFilter("git")).toContain("not supported here yet");
  });
});

describe("heroSuggestion", () => {
  it("walks a beginner through the first commit", () => {
    expect(heroSuggestion(run([]), [])).toBe("git init");
    expect(heroSuggestion(run(["git init"]), ["git init"])).toBe("git status");
    expect(heroSuggestion(run(["git init"]), ["git init", "git status"])).toBe("git add .");
    expect(heroSuggestion(run(["git init", "git add ."]), ["git status"])).toBe(
      'git commit -m "first commit"',
    );
    expect(heroSuggestion(run(["git init", "git add .", 'git commit -m "x"']), ["git status"])).toBe(
      "git log",
    );
  });
});

describe("fileZone", () => {
  it("follows README.md from working to staging to local", () => {
    expect(fileZone(run([]), "README.md")).toBe("working");
    expect(fileZone(run(["git init"]), "README.md")).toBe("working");
    expect(fileZone(run(["git init", "git add ."]), "README.md")).toBe("staging");
    expect(fileZone(run(["git init", "git add .", 'git commit -m "x"']), "README.md")).toBe("local");
  });

  it("moves back to working when a committed file changes", () => {
    const repo = run(["git init", "git add .", 'git commit -m "x"', "echo changed > README.md"]);

    expect(fileZone(repo, "README.md")).toBe("working");
  });
});
