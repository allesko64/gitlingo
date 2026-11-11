import { SCENE_COLORS } from "@/lib/landing/sceneConfig";

const COLUMNS = 320;

function heightAt(x: number): number {
  return Math.max(1, Math.round(3 + 1.6 * Math.sin(x * 0.045) + 1.1 * Math.sin(x * 0.13 + 1.3)));
}

const PATH = Array.from({ length: COLUMNS }, (_, x) => `M${x} 0h1v${heightAt(x)}h-1z`).join("");

export function HillEdge() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${COLUMNS} 6`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className="absolute inset-x-0 top-0 h-6 w-full"
    >
      <path d={PATH} fill={SCENE_COLORS.nearField} />
    </svg>
  );
}
