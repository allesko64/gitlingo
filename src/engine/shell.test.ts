import { describe, expect, it } from "vitest";
import { execute } from "./execute";
import { createEmptyRepo } from "./repo";
import type { CommandResult } from "./types";

function runAll(inputs: string[]): CommandResult {
  let result: CommandResult = { repo: createEmptyRepo(), output: "" };

  for (const input of inputs) {
    result = execute(result.repo, input);
  }

  return result;
}

describe("touch", () => {
  it("creates an empty file", () => {
    const { repo, output } = runAll(["touch a.txt"]);

    expect(repo.workingDir).toEqual({ "a.txt": "" });
    expect(output).toBe("");
  });

  it("creates several files at once", () => {
    const { repo } = runAll(["touch a.txt b.txt"]);

    expect(repo.workingDir).toEqual({ "a.txt": "", "b.txt": "" });
  });

  it("keeps the content of a file that already exists", () => {
    const { repo } = runAll(["echo hello > a.txt", "touch a.txt"]);

    expect(repo.workingDir["a.txt"]).toBe("hello");
  });

  it("needs a file name", () => {
    expect(runAll(["touch"]).output).toBe("touch: missing file operand");
  });

  it("never changes the repo it was given", () => {
    const repo = createEmptyRepo();
    const before = structuredClone(repo);

    execute(repo, "touch a.txt");

    expect(repo).toEqual(before);
  });
});

describe("echo", () => {
  it("prints its words joined by spaces", () => {
    expect(runAll(["echo hello   world"]).output).toBe("hello world");
  });

  it("prints quoted text as written", () => {
    expect(runAll(['echo "hello   world"']).output).toBe("hello   world");
  });

  it("writes into a file with > and prints nothing", () => {
    const { repo, output } = runAll(["echo hello > a.txt"]);

    expect(repo.workingDir["a.txt"]).toBe("hello");
    expect(output).toBe("");
  });

  it("replaces the content of an existing file", () => {
    const { repo } = runAll(["echo one > a.txt", "echo two > a.txt"]);

    expect(repo.workingDir["a.txt"]).toBe("two");
  });

  it("never changes the repo it was given", () => {
    const repo = createEmptyRepo();
    const before = structuredClone(repo);

    execute(repo, "echo hello > a.txt");

    expect(repo).toEqual(before);
  });
});

describe("ls", () => {
  it("prints nothing in an empty folder", () => {
    expect(runAll(["ls"]).output).toBe("");
  });

  it("lists files in alphabetical order", () => {
    expect(runAll(["touch c.txt a.txt b.txt", "ls"]).output).toBe("a.txt  b.txt  c.txt");
  });

  it("does not support arguments yet", () => {
    expect(runAll(["ls -a"]).output).toBe("ls: arguments are not supported yet");
  });
});

describe("cat", () => {
  it("prints a file's content", () => {
    expect(runAll(["echo hello > a.txt", "cat a.txt"]).output).toBe("hello");
  });

  it("prints several files one after another", () => {
    const { output } = runAll(["echo one > a.txt", "echo two > b.txt", "cat a.txt b.txt"]);

    expect(output).toBe("one\ntwo");
  });

  it("reports a missing file", () => {
    expect(runAll(["cat missing.txt"]).output).toBe(
      "cat: missing.txt: No such file or directory",
    );
  });

  it("needs a file name", () => {
    expect(runAll(["cat"]).output).toBe("cat: missing file operand");
  });

  it("is not fooled by built-in object names", () => {
    expect(runAll(["cat toString"]).output).toBe(
      "cat: toString: No such file or directory",
    );
  });
});

describe("shell commands in execute", () => {
  it("only allows > with echo", () => {
    expect(runAll(["ls > files.txt"]).output).toBe("> is only supported with echo");
  });

  it("is not fooled by built-in object names", () => {
    expect(runAll(["toString"]).output).toBe("command not found: toString");
  });
});
