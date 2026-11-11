import { describe, expect, it } from "vitest";
import { execute } from "@/engine/execute";
import { runAll } from "@/engine/test-utils";
import { blockTone, toneLines } from "./output";

const READY = ["git init", "touch a.txt", "git add a.txt"];

describe("blockTone", () => {
  it("marks successful git actions as success", () => {
    expect(blockTone(runAll(["git init"]).output)).toBe("success");
    expect(blockTone(runAll([...READY, 'git commit -m "x"']).output)).toBe("success");
    expect(blockTone(runAll([...READY, 'git commit -m "x"', "git branch f", "git switch f"]).output)).toBe("success");
  });

  it("marks merges and fast-forwards as success", () => {
    const base = runAll([...READY, 'git commit -m "x"', "git branch f", "git switch f", "touch b.txt", "git add b.txt", 'git commit -m "y"', "git switch main"]).repo;
    expect(blockTone(execute(base, "git merge f").output)).toBe("success");
  });

  it("marks errors and unsupported commands as warn", () => {
    expect(blockTone(runAll(["git status"]).output)).toBe("warn");
    expect(blockTone(runAll(["foo"]).output)).toBe("warn");
    expect(blockTone("ls is not supported here yet. Type help to see what you can try.")).toBe("warn");
  });

  it("leaves normal output plain", () => {
    expect(blockTone(runAll(["git init", "git status"]).output)).toBe("plain");
    expect(blockTone(runAll(["touch a.txt", "ls"]).output)).toBe("plain");
  });
});

describe("toneLines", () => {
  it("colors hint lines as hints and keeps the rest of the block", () => {
    const lines = toneLines(runAll([...READY, "git commit -m first commit"]).output);

    expect(lines.map((line) => line.tone)).toEqual(["warn", "hint"]);
  });

  it("keeps empty lines so spacing survives", () => {
    expect(toneLines("a\n\nb").map((line) => line.text)).toEqual(["a", "", "b"]);
  });
});
