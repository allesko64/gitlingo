import { describe, expect, it } from "vitest";
import { runAll } from "../test-utils";
import { resolveRef } from "./helpers";

const TWO_COMMITS = [
  "git init",
  "echo one > a.txt",
  "git add a.txt",
  'git commit -m "one"',
  "echo two > a.txt",
  "git add a.txt",
  'git commit -m "two"',
  "git branch feature",
];

describe("resolveRef", () => {
  const repo = runAll(TWO_COMMITS).repo;
  const [first, second] = Object.values(repo.commits)
    .sort((a, b) => a.order - b.order)
    .map((c) => c.hash);

  it("resolves HEAD to the current commit", () => {
    expect(resolveRef(repo, "HEAD")).toBe(second);
  });

  it("walks back with HEAD~N", () => {
    expect(resolveRef(repo, "HEAD~1")).toBe(first);
    expect(resolveRef(repo, "HEAD~0")).toBe(second);
  });

  it("returns null when walking past the root", () => {
    expect(resolveRef(repo, "HEAD~2")).toBeNull();
  });

  it("resolves branch names and raw hashes", () => {
    expect(resolveRef(repo, "feature")).toBe(second);
    expect(resolveRef(repo, first)).toBe(first);
  });

  it("returns null for unknown refs and on an unborn branch", () => {
    expect(resolveRef(repo, "nope")).toBeNull();
    expect(resolveRef(runAll(["git init"]).repo, "HEAD")).toBeNull();
  });
});
