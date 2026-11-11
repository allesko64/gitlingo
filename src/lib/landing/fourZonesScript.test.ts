import { describe, expect, it } from "vitest";
import { arrivals, FILE_IDS, FOUR_ZONES_SCRIPT, itemsIn } from "./fourZonesScript";

const steps = FOUR_ZONES_SCRIPT;

describe("four zones script", () => {
  it("has 6 steps with unique ids", () => {
    expect(steps).toHaveLength(6);
    expect(new Set(steps.map((step) => step.id)).size).toBe(6);
  });

  it("always has every file exactly once in working", () => {
    for (const step of steps) {
      expect(Object.keys(step.state.working).sort(), step.id).toEqual([...FILE_IDS].sort());
    }
  });

  it("never has a duplicate in any zone", () => {
    for (const step of steps) {
      for (const zone of ["staging", "local", "remote"] as const) {
        const items = itemsIn(step.state, zone);
        expect(new Set(items).size, `${step.id} ${zone}`).toBe(items.length);
      }
    }
  });

  it("only moves items that exist in the previous state's source zone", () => {
    steps.forEach((step, i) => {
      if (i === 0) {
        expect(step.moves).toEqual([]);
        return;
      }
      const before = steps[i - 1].state;
      for (const move of step.moves) {
        for (const item of move.items) {
          expect(itemsIn(before, move.from), `${step.id}: ${item} in ${move.from}`).toContain(item);
        }
      }
    });
  });

  it("keeps the original after a copy", () => {
    for (const step of steps) {
      for (const move of step.moves.filter((m) => m.kind === "copy")) {
        for (const item of move.items) {
          expect(itemsIn(step.state, move.from), `${step.id}: ${item} stays in ${move.from}`).toContain(item);
          expect(itemsIn(step.state, move.to), `${step.id}: ${item} lands in ${move.to}`).toContain(item);
        }
      }
    }
  });

  it("empties staging and makes exactly 1 local commit after commit", () => {
    expect(steps[2].state.staging).toEqual([]);
    expect(steps[2].state.local).toHaveLength(1);
  });

  it("has a1b2c3d in both local and remote after push", () => {
    expect(itemsIn(steps[3].state, "local")).toContain("a1b2c3d");
    expect(itemsIn(steps[3].state, "remote")).toContain("a1b2c3d");
  });

  it("has both commits in order in local after pull", () => {
    expect(itemsIn(steps[5].state, "local")).toEqual(["a1b2c3d", "9f8e7d6"]);
  });

  it("keeps captions to 14 words or fewer", () => {
    for (const step of steps) {
      expect(step.caption.split(/\s+/).length, step.id).toBeLessThanOrEqual(14);
    }
  });

  it("shows a command or a comment on every step after the first", () => {
    for (const step of steps.slice(1)) {
      expect(step.command !== null || step.comment !== undefined, step.id).toBe(true);
    }
  });

  it("lists what arrives in each zone", () => {
    expect(arrivals(steps[0].state, steps[1].state)).toEqual(["staging:index.html", "staging:style.css"]);
    expect(arrivals(steps[1].state, steps[2].state)).toEqual(["local:a1b2c3d"]);
    expect(arrivals(steps[3].state, steps[4].state)).toEqual(["remote:9f8e7d6"]);
    expect(arrivals(steps[4].state, steps[5].state)).toEqual(["local:9f8e7d6"]);
  });
});
