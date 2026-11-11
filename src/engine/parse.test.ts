import { describe, expect, it } from "vitest";
import { parse, tokenize } from "./parse";

describe("tokenize", () => {
  it("splits words on spaces", () => {
    expect(tokenize("git add notes.txt")).toEqual(["git", "add", "notes.txt"]);
  });

  it("ignores extra spaces", () => {
    expect(tokenize("  git    status  ")).toEqual(["git", "status"]);
  });

  it("returns an empty list for empty input", () => {
    expect(tokenize("")).toEqual([]);
    expect(tokenize("    ")).toEqual([]);
  });

  it("keeps double-quoted text together", () => {
    expect(tokenize('git commit -m "my first commit"')).toEqual([
      "git",
      "commit",
      "-m",
      "my first commit",
    ]);
  });

  it("keeps single-quoted text together", () => {
    expect(tokenize("git commit -m 'add readme'")).toEqual([
      "git",
      "commit",
      "-m",
      "add readme",
    ]);
  });

  it("lets one kind of quote appear inside the other", () => {
    expect(tokenize(`echo "it's done"`)).toEqual(["echo", "it's done"]);
  });

  it("makes > its own token even without spaces", () => {
    expect(tokenize("echo hi>a.txt")).toEqual(["echo", "hi", ">", "a.txt"]);
  });

  it("keeps > inside quotes as normal text", () => {
    expect(tokenize('echo "a > b"')).toEqual(["echo", "a > b"]);
  });
});

describe("parse", () => {
  it("splits a command into name and args", () => {
    expect(parse("git add notes.txt")).toEqual({
      ok: true,
      command: { name: "git", args: ["add", "notes.txt"], redirect: null },
    });
  });

  it("finds the redirect file", () => {
    expect(parse("echo hello > notes.txt")).toEqual({
      ok: true,
      command: { name: "echo", args: ["hello"], redirect: "notes.txt" },
    });
  });

  it("finds the redirect file without spaces", () => {
    expect(parse("echo hello>notes.txt")).toEqual({
      ok: true,
      command: { name: "echo", args: ["hello"], redirect: "notes.txt" },
    });
  });

  it("rejects > with no file name", () => {
    expect(parse("echo hello >")).toEqual({
      ok: false,
      error: "syntax error: expected a file name after >",
    });
  });

  it("rejects more than one >", () => {
    expect(parse("echo hi > a.txt > b.txt")).toEqual({
      ok: false,
      error: "syntax error: only one > is supported",
    });
  });

  it("rejects > with no command before it", () => {
    expect(parse("> a.txt")).toEqual({
      ok: false,
      error: "syntax error: missing command before >",
    });
  });

  it("rejects empty input", () => {
    expect(parse("   ")).toEqual({ ok: false, error: "empty command" });
  });
});
