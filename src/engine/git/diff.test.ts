import { describe, expect, it } from "vitest";
import { runAll } from "../test-utils";

const COMMITTED = ["git init", "echo Hello > hello.txt", "git add hello.txt", 'git commit -m "Add hello"'];

describe("git diff", () => {
  it("prints nothing when the working folder matches the index", () => {
    expect(runAll([...COMMITTED, "git diff"]).output).toBe("");
  });

  it("shows removed and added lines for an unstaged edit", () => {
    expect(runAll([...COMMITTED, 'echo "Hello world" > hello.txt', "git diff"]).output).toBe(
      ["diff --git a/hello.txt b/hello.txt", "--- a/hello.txt", "+++ b/hello.txt", "-Hello", "+Hello world"].join("\n"),
    );
  });

  it("moves to --staged once the edit is added", () => {
    const { output } = runAll([...COMMITTED, 'echo "Hello world" > hello.txt', "git add hello.txt", "git diff"]);
    expect(output).toBe("");

    const staged = runAll([
      ...COMMITTED,
      'echo "Hello world" > hello.txt',
      "git add hello.txt",
      "git diff --staged",
    ]).output;
    expect(staged).toContain("-Hello\n+Hello world");
  });

  it("marks new files against /dev/null", () => {
    const { output } = runAll([...COMMITTED, "echo notes > notes.txt", "git add notes.txt", "git diff --cached"]);
    expect(output).toBe(
      [
        "diff --git a/notes.txt b/notes.txt",
        "new file mode 100644",
        "--- /dev/null",
        "+++ b/notes.txt",
        "+notes",
      ].join("\n"),
    );
  });

  it("rejects other options", () => {
    expect(runAll([...COMMITTED, "git diff --stat"]).output).toBe("git diff: option '--stat' is not supported yet");
  });
});
