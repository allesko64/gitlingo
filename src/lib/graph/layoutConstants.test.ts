import { describe, expect, it } from "vitest";
import { GRAPH, resolveLayout } from "./layoutConstants";

describe("resolveLayout", () => {
  it("uses desktop steps that grow with spare panel width", () => {
    const roomy = resolveLayout(1280, 0);
    expect(roomy.xStep).toBe(128);
    expect(roomy.laneStep).toBe(72);
    expect(roomy.padX).toBe(56);
    expect(roomy.padY).toBe(48);
    expect(roomy.nodeRadius).toBe(9);
    expect(roomy.headRingRadius).toBe(15);
  });

  it("clamps X_STEP down when many generations share a narrow panel", () => {
    const tight = resolveLayout(640, 12);
    expect(tight.xStep).toBe(88);
  });

  it("uses the mobile set when the viewport is under 640px", () => {
    const mobile = resolveLayout(360, 4, 390);
    expect(mobile.xStep).toBe(72);
    expect(mobile.laneStep).toBe(64);
    expect(mobile.padX).toBe(40);
    expect(mobile.padY).toBe(40);
    expect(mobile.nodeRadius).toBe(8);
    expect(mobile.headRingRadius).toBe(13);
  });

  it("keeps desktop spacing when a narrow side panel sits in a wide viewport", () => {
    const side = resolveLayout(588, 0, 1280);
    expect(side.xStep).toBe(128);
    expect(side.laneStep).toBe(72);
    expect(side.nodeRadius).toBe(9);
  });

  it("exports GRAPH from the desktop defaults used by tests", () => {
    expect(GRAPH).toEqual(resolveLayout(1280, 3));
  });
});
