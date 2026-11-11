import { describe, expect, it } from "vitest";
import { makeHash } from "./hash";

describe("makeHash", () => {
  it("gives the same hash for the same input", () => {
    expect(makeHash("first commit")).toBe(makeHash("first commit"));
  });

  it("gives different hashes for different inputs", () => {
    expect(makeHash("first commit")).not.toBe(makeHash("second commit"));
  });

  it("returns 7 lowercase hex characters", () => {
    expect(makeHash("first commit")).toMatch(/^[0-9a-f]{7}$/);
    expect(makeHash("")).toMatch(/^[0-9a-f]{7}$/);
  });
});
