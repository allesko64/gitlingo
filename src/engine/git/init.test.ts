import { describe, expect, it } from "vitest";
import { execute } from "../execute";
import { createEmptyRepo } from "../repo";
import { runAll } from "../test-utils";

describe("git init", () => {
  it("turns the folder into a repository", () => {
    const { repo, output } = runAll(["git init"]);

    expect(repo.initialized).toBe(true);
    expect(repo.head).toBe("main");
    expect(output).toBe("Initialized empty Git repository in .git/");
  });

  it("does not create any branch until the first commit", () => {
    const { repo } = runAll(["git init"]);

    expect(repo.branches).toEqual({});
    expect(repo.commits).toEqual({});
  });

  it("keeps files that already exist", () => {
    const { repo } = runAll(["echo hello > a.txt", "git init"]);

    expect(repo.workingDir).toEqual({ "a.txt": "hello" });
  });

  it("says reinitialized when run twice and changes nothing", () => {
    const first = runAll(["git init"]);
    const second = execute(first.repo, "git init");

    expect(second.output).toBe("Reinitialized existing Git repository in .git/");
    expect(second.repo).toEqual(first.repo);
  });

  it("does not support options yet", () => {
    expect(runAll(["git init --bare"]).output).toBe("git init: options are not supported yet");
  });

  it("never changes the repo it was given", () => {
    const repo = createEmptyRepo();
    const before = structuredClone(repo);

    execute(repo, "git init");

    expect(repo).toEqual(before);
  });
});

describe("git", () => {
  it("shows usage when run with no subcommand", () => {
    expect(runAll(["git"]).output).toBe("usage: git <command>");
  });

  it("reports unknown subcommands", () => {
    expect(runAll(["git foo"]).output).toBe("git: 'foo' is not a git command. See 'git --help'.");
  });

  it("is not fooled by built-in object names", () => {
    expect(runAll(["git toString"]).output).toBe(
      "git: 'toString' is not a git command. See 'git --help'.",
    );
  });
});
