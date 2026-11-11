import { describe, expect, it } from "vitest";
import { execute } from "./execute";
import { createEmptyRepo } from "./repo";

describe("execute", () => {
  it("does nothing for empty input", () => {
    const repo = createEmptyRepo();

    const result = execute(repo, "   ");

    expect(result.output).toBe("");
    expect(result.repo).toEqual(repo);
  });

  it("reports unknown commands", () => {
    const result = execute(createEmptyRepo(), "foo bar");

    expect(result.output).toBe("command not found: foo");
  });

  it("reports unknown commands that use quotes or >", () => {
    expect(execute(createEmptyRepo(), '"foo" bar').output).toBe("command not found: foo");
    expect(execute(createEmptyRepo(), "foo>a.txt").output).toBe("command not found: foo");
  });

  it("shows syntax errors from the parser", () => {
    const repo = createEmptyRepo();

    const result = execute(repo, "echo hi >");

    expect(result.output).toBe("syntax error: expected a file name after >");
    expect(result.repo).toEqual(repo);
  });

  it("never changes the repo it was given", () => {
    const repo = createEmptyRepo();
    const before = structuredClone(repo);

    execute(repo, "foo");

    expect(repo).toEqual(before);
  });
});
